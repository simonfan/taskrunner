define(['taskrunner'], function(TaskRunner) {
	window.taskrunner = TaskRunner.build();

	taskrunner.task('test-first', function(next, common) {
		console.log('test-first')

		// set a value on common
		common.message = '"message set on the common object passed as second arg to all tasks"'

		setTimeout(function() { next('alsdjlaks'); }, 3000);
	});

	taskrunner.task('test-second', function(next, common) {
		console.log('test-second, message on common: ' + common.message);
		setTimeout(function() { next() }, 600);
	});

	taskrunner.task('test-third', function(next, common) {
		next();
	});

	taskrunner.task('test-fourth', function(next, common) {

		setTimeout(function() {
			next();
		}, 900);
	});



	// ANoNYMOUS TASK
	taskrunner.task(function(promise, common) {

		console.log('running annonymous task');

		setTimeout(function() {
			promise();

			console.log('annonymous task finished');
		}, 3000);
	});



	taskrunner.on('sequence-start', function() {
		console.log('sequence started event at ' + new Date().getTime() / 1000);
	});

	taskrunner.on('start', function(taskname) {
		console.log('start event:' + taskname + ' ' + new Date().getTime() / 1000);
	});

	taskrunner.on('done', function(taskname) {
		console.log('done event:' + taskname + ' ' + new Date().getTime() / 1000);
	});

	taskrunner.on('done:test-second', function() {
		console.log('done:test-second event')
	});




	taskrunner.on('start:test-third', function() {
		console.log('start:test-third event');
	})

	taskrunner.on('sequence-done', function() {
		console.log('sequence finished event at ' + new Date().getTime() / 1000);
	});

	window.aaa = taskrunner.run(['test-first','test-second','test-third']);
});