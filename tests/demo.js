define(['taskrunner'], function(TaskRunner) {
	window.taskrunner = TaskRunner.build();

	taskrunner.add('test-first', function(defer, common) {
		console.log('test-first')

		// set a value on common
		common.message = '"message set on the common object passed as second arg to all tasks"'

		setTimeout(function() { defer.resolve('alsdjlaks'); }, 3000);
	});

	taskrunner.add('test-second', function(defer, common) {
		console.log('test-second, message on common: ' + common.message);
		setTimeout(function() { defer.resolve() }, 600);
	});

	taskrunner.add('test-third', function(defer, common) {
		defer.resolve();
	});

	taskrunner.add('test-fourth', function(defer, common) {

		setTimeout(function() {
			defer.resolve();
		}, 900);
	});



	// ANoNYMOUS TASK
	taskrunner.add(function(promise, common) {

		console.log('running annonymous task');

		setTimeout(function() {
			promise.resolve();

			console.log('annonymous task finished');
		}, 3000);
	});



	taskrunner.on('sequence-start', function() {
		console.log('sequence started event at ' + new Date().getTime() / 1000);
	});

	taskrunner.on('start', function(taskname) {
		console.log('start event:' + taskname + ' ' + new Date().getTime() / 1000);
	});

	taskrunner.on('complete', function(taskname) {
		console.log('complete event:' + taskname + ' ' + new Date().getTime() / 1000);
	});

	taskrunner.on('complete:test-second', function() {
		console.log('complete:test-second event')
	});




	taskrunner.on('start:test-third', function() {
		console.log('start:test-third event');
	})

	taskrunner.on('sequence-complete', function() {
		console.log('sequence finished event at ' + new Date().getTime() / 1000);
	});

	taskrunner.run();
});