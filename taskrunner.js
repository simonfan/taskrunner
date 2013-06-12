define(['jquery','buildable','backbone','underscore', '_.mixins'],
function(   $   , Buildable , Backbone , undef      , undef     ) {

	var TaskRunner = Object.create(Buildable);
	TaskRunner.extend(Backbone.Events, {
		init: function(taskorder, tasks) {
			// tasks are functions that take a promise as their first parameter 
			// and somewhere in time solves the promise, so that another task may be run.
			// All solved parameters are passed on to the next function in the task list.

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
		run: function(parameters, options) {
			// params: parameters to be passed to the task
			// options: additional options
			//			- silent: true if no events are requested
			//			- ini
			//			- end

			if (this.isComplete()) { return true; }

			var parameters = parameters || [],
				options = options || {},
				iniIndex = options.ini ?  _.indexOf(this.taskorder, ini_end[0]) : 0,
				endIndex = options.end ? _.indexOf(this.taskorder, ini_end[1]) : this.taskorder.length -1;

			if (iniIndex !== -1 && endIndex !== -1) {

				var _this = this,
					tasksToRun = _.clone(this.taskorder).slice(iniIndex, endIndex + 1),
					lastPromise = false;

				_.each(tasksToRun, function(taskname, index) {

					var task = _this.tasks[ taskname ],		// get the task
						currentPromise = $.Deferred();		// create the defer object for the current task

					// trigger events when this task is done
					$.when(currentPromise).then(function() {
						_this._complete(taskname, options);
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

		_complete: function(taskname, options) {

			if (!options.silent) {
				this.trigger('complete', taskname);
			}
			
			this.done[ taskname ] = true;

			this.status = 'incomplete';

			if ( taskname === _.last(this.taskorder) ) {
				if (!options.silent) {
					this.trigger('sequence-complete');
				}
				this.status = 'complete';
			}
		},
	})

	return TaskRunner;
});