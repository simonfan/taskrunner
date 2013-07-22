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

		run: function(tasknames, common, insist) {

			var args = _.args(arguments);

			if (!this.condition.apply(this, args)) {
				// if the conditional method returns false, 
				// just return the deferred
				return this.deferred;
			}

			var _this = this,
				tasks = _.map(tasknames, function(taskname, order) {
					return _this.taskrunner('task', taskname);
				});

			// save the tasknames array as the queue to be executed
			this.currentQueue = tasknames;


			// emit sequence-start evnet
			this.emit('sequence-start', this);

			// run the tasks
			var asynch = _.asynch({
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
				common: common || {},
				map: tasknames,
				tasks: tasks
			});

			// when the sequence is finished, delete the tasks
			asynch.then(function() {
				// emit 'sequence-done' event
				_this.emit('sequence-done', _this);

				// reset queue
				_this.currentQueue = false;
			});


			// save the asynch deferred
			this.deferred = asynch;

			// return the asynch deferred
			return this.deferred;
		}
	};

	var TaskRunner = Object.create(Buildable);
	TaskRunner.extend(EventEmitter2.prototype, {
		init: function(options) {
			_.bindAll(this, 'taskrunner','task','run');

			this.deferred = true;
			this.currentQueue = false;
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
		// RECEIVES: queue, tasks, options
		condition: function(queue, tasks, options) {
			return JSON.stringify(tasks) !== JSON.stringify(queue);
		},
	})

	return TaskRunner;
});