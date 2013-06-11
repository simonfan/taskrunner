define(['taskrunner'], function(TaskRunner) {
	window.taskrunner = TaskRunner.build();

	taskrunner.add([
		{
			name: 'test-first',
			task: function(defer) {
				console.log('first: ' + new Date().getTime() / 1000)
				setTimeout(function() { defer.resolve('alsdjlaks'); }, 3000);
			}
		},
		{
			name: 'test-second',
			task: function(defer, message) {
				console.log('test-second' + ' ' + message);
				setTimeout(function() { defer.resolve() }, 600);
			}
		}
	]);

	taskrunner.add([
		{
			name: 'test-third',
			task: function(defer) {


				defer.resolve();
			}
		},
		{
			name: 'test-fourth',
			task: function(defer) {

				setTimeout(function() {
					defer.resolve();
				}, 900);
			}
		}
	]);


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