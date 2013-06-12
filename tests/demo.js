define(['taskrunner'], function(TaskRunner) {
	window.taskrunner = TaskRunner.build();

	taskrunner.add('test-first', function(defer) {
		console.log('first: ' + new Date().getTime() / 1000)
		setTimeout(function() { defer.resolve('alsdjlaks'); }, 3000);
	});

	taskrunner.add('test-second', function(defer, message) {
		console.log('test-second' + ' ' + message);
		setTimeout(function() { defer.resolve() }, 600);
	});

	taskrunner.add('test-third', function(defer) {
		defer.resolve();
	});

	taskrunner.add('test-fourth', function(defer) {

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