define(['buildable','underscore','eventemitter2','_.mixins','json2'],
function(Buildable , undef      , EventEmitter2 , undef    , undef ) {

	var tr = {
		task: function(name, task) {
			return _.getset({
				context: this,
				obj: '_tasks',
				name: name,
				value: task
			});
		},

		run: function(tasknames, asynchOptions) {

			var _this = this,
				asynchOptions = asynchOptions || {},
				tasks = _.map(tasknames, function(taskname, order) {
					return _this.taskrunner('task', taskname);
				});

			// save the tasknames array as the queue to be executed
			this.queue = tasknames;

			// default options
			_.defaults(asynchOptions, {
				context: _this,
				before: function(taskname) {
					// emit events
					this.emit('start:'+taskname, this);
					this.emit('start', taskname, this);
				},
				after: function(taskname) {
					// emit events
					this.emit('done:'+taskname, this);
					this.emit('done', taskname, this);
				},
				common: {},
				map: tasknames,
			});

			// set the tasks array
			asynchOptions.tasks = tasks;

			// emit sequence-start evnet
			this.emit('sequence-start', this);

			// run the tasks
			var asynch = _.asynch(asynchOptions);

			// when the sequence is finished, delete the tasks
			asynch.then(function() {
				// emit 'sequence-done' event
				_this.emit('sequence-done', _this);

				// reset queue
				_this.queue = false;
			})

			// return the asynch promise
			return asynch;
		}
	};

	var TaskRunner = Object.create(Buildable);
	TaskRunner.extend(EventEmitter2.prototype, {
		init: function(options) {
			_.bindAll(this, 'taskrunner','task','run');

			this.queue = false;
		},

		taskrunner: function(method) {
			var args = _.args(arguments, 1);
			return tr[ method ].apply(this, args);
		},

		task: tr.task,
		run: tr.run,

		// the default condition method
		// checks if the task should be run
		// this method sould be overwritten
		// by the objects that extend the taskrunner
		condition: function(tasks, options) {
			return JSON.stringify(tasks) === JSON.stringify(this.queue);
		},
	})

	return TaskRunner;
});