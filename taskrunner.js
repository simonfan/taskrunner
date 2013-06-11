define(['jquery','buildable','backbone','underscore', '_.mixins'],
function(   $   , Buildable , Backbone , undef      , undef     ) {

	var TaskRunner = Object.create(Buildable);
	TaskRunner.extend(Backbone.Events, {
		init: function(taskorder, tasks) {
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

			this.taskorder = taskorder || [];	// a list of tasks by name
			this.tasks = tasks || {};			// a hash where reference to tasks is saved

			this.done = {};
			this.status = 'unstarted';
		},

		reset: function() {
			this.done = {};
			this.status = 'unstarted';
		},

		isComplete: function(taskname) {
			if (taskname) {
				return this.done[ taskname ];
			} else {
				return this.status === 'complete';
			}
		},

		add: function(name, task) {

			// first deal with the name
			if ( _.isArray(name) ) {
				// merge the arrays
				this.taskorder = this.taskorder.concat(name);

			} else {
				this.taskorder.push(name);
			}

			// then deal with the task
			if ( typeof task === 'function' ) {
				// use the name as hash
				this.tasks[ name ] = task;
			} else if ( task === 'object' ) {

				// merge the objects
				this.tasks = _.extend(this.tasks, task);
			}

			return this;
		},
		
		remove: function(name) {

			if ( _.isArray(name) ) {
				// recursive
				_.each(name, this.remove);
			} else {

				this.taskorder = _.without(this.taskorder, name);
				delete this.tasks[ name ];
			}

			return this;
		},

		get: function(name) {
			return this.tasks[ name ];
		},

		rerun: function(params, ini, end) {
			this.reset();
			this.run(params, ini, end);
		},

		// runs a sequence of tasks
		run: function(parameters, ini_end, options) {
			// params: parameters to be passed to the task
			// ini_end: array with name of starting task as 0 and ending task as 1
			// options: additional options
			//			- silent: true if no events are requested

			if (this.isComplete()) { return true; }

			var parameters = parameters || [],
				options = options || {},
				iniIndex = ini_end[0] ?  _.indexOf(this.taskorder, ini_end[0]) : 0,
				endIndex = ini_end[1] ? _.indexOf(this.taskorder, ini_end[1]) : this.taskorder.length -1;

			if (iniIndex !== -1 && endIndex !== -1) {

				var _this = this,
					tasksToRun = _.clone(this.taskorder).slice(iniIndex, endIndex + 1),
					lastPromise = false;

				_.each(tasksToRun, function(taskname, index) {

					var task = _this.tasks[ taskname ],		// get the task
						currentPromise = $.Deferred();		// create the defer object for the current task

					// trigger events when this task is done
					$.when(currentPromise).then(function() {
						_this._complete(task, options);
					});

					if (lastPromise) {
						// if there are promises, wait until it is resolved to run
						$.when(lastPromise)
						.then(
							function() {
								// pass the arguments to the next task
								var args = _.args(arguments);

								// add the promise to the arguments to be passed to the next task
								args.unshift(currentPromise);

								task.apply(null, args);
							}
						);
					} else {
						// else, if there are no deferrals on list,
						// task the task immediately
						parameters.unshift(currentPromise)
						task.apply(null, parameters);
					}

					// set the lastPromise value as the current task defer
					lastPromise = currentPromise;
				});

				// return the defer of the last task, so that
				// this respects the promise and stuff like that.
				return lastPromise;
			}
		},

		_complete: function(task, options) {
			this.trigger('complete', task.name);
			this.done.push(task.name);

			this.status = 'incomplete';

			if ( task.name === _.last(this.taskorder) ) {
				this.trigger('sequence-complete');
				this.status = 'complete';
			}
		},
	})

	return TaskRunner;
});