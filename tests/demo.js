define(['taskrunner'], function(TaskRunner) {
	window.taskrunner = TaskRunner.build();

	taskrunner.add('test-first', function(defer, common) {
		console.log('first: ' + new Date().getTime() / 1000)

		// set a value on common
		common.message = 'hahahahaha'

		setTimeout(function() { defer.resolve('alsdjlaks'); }, 3000);
	});

	taskrunner.add('test-second', function(defer, common, message) {
		console.log('test-second, message on common: ' + common.message);
		console.log('test-second' + ' ' + message);
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


	taskrunner.on('sequence-start', function(taskname) {
		console.log('sequence started');
	});

	taskrunner.on('complete', function(taskname) {
		console.log('complete:' + taskname + ' ' + new Date().getTime() / 1000);
	});

	taskrunner.on('sequence-complete', function(taskname) {
		console.log('sequence finished');
	});

	taskrunner.run();
});