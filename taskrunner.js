define(['jquery','buildable','backbone','underscore', '_.mixins'],
function(   $   , Buildable , Backbone , undef      , undef     ) {

	var TaskRunner = Object.create(Buildable);
	TaskRunner.extend(Backbone.Events, {
		init: function(tasks) {
			/*
				tasks: [
					{
						name: 'task name',
						task: function (defer),
						context: 
					},
					...
				]
			*/

			_.bindAll(this);

			this.tasks = tasks || [];
			this.taskorder = _.map(tasks, function(task) {
				return task.name;
			});

			this.done = [];
			this.status = 'not-started';
		},

		reset: function() {
			this.done = [];
			this.status = 'not-started';
		},

		rerun: function() {
			this.reset();
			this.run();
		},

		isComplete: function(taskname) {
			if (taskname) {
				return _.indexOf(this.done, taskname) !== -1;
			} else {
				return this.status === 'complete';
			}
		},

		add: function(task, at) {

			if ( _.isArray(task) ) {
				var _this = this;
				// recursive
				_.each(task, function(task, index) {
					_this.add(task);
				});
				
			} else {

				at = at || this.tasks.length;
				this.tasks.splice(at, 0, task);
				this.taskorder.splice(at, 0, task.name);

			}

			return this;
		},
		
		remove: function(name) {
			var pos = _.indexOf(this.taskorder, name);
			if (pos !== -1) {
				this.tasks.splice( pos - 1, 1);
				this.taskorder.splice( pos - 1, 1);
			}

			return this;
		},

		find: function(name) {
			return _.find(this.tasks, function(task) {
				return task.name === name;
			});
		},

		// runs a sequence of tasks
		run: function(args, ini, end) {

			var iniIndex = ini ?  _.indexOf(this.taskorder, ini) : 0,
				endIndex = end ? _.indexOf(this.taskorder, end) : this.taskorder.length -1;

			if (iniIndex !== -1 && endIndex !== -1) {

				var _this = this,
					tasksToRun = _.clone(this.tasks).slice(iniIndex, endIndex + 1),
					lastDefer = false;

				_.each(tasksToRun, function(task, index) {

					// create the defer object for the current task
					var currentDefer = $.Deferred();

					// trigger events
					$.when(currentDefer).then(function() {
						_this._complete(task);
					});

					if (lastDefer) {
						// if there are defer objects, only run the task after the last defer
						// is solved
						$.when(lastDefer)
						.then(
							function() {
								// pass the arguments to the next task
								var args = _.args(arguments);

								// add the deferral to the arguments to be passed to the next task
								args.unshift(currentDefer);

								task.task.apply(task.context, args);
							}
						);
					} else {
						// else, if there are no deferrals on list,
						// task the task immediately
						task.task.call(task.context, currentDefer);
					}

					// set the lastDefer value as the current task defer
					lastDefer = currentDefer;
				});
			}
		},

		_complete: function(task) {
			this.trigger('complete', task.name);
			this.done.push(task.name);

			this.status = 'incomplete';

			if ( task.name === _.last(this.taskorder) ) {
				this.trigger('sequence-complete', task.name);
				this.status = 'complete';
			}
		},
	})

	return TaskRunner;
});