var Plotly = require('@src/plotly');

describe('Test graph_obj', function () {
    'use strict';

    describe('Plotly.restyle', function() {
        beforeEach(function() {
            spyOn(Plotly.Plots, 'previousPromises');
            spyOn(Plotly, 'plot');
            spyOn(Plotly.Scatter, 'arraysToCalcdata');
            spyOn(Plotly.Bars, 'arraysToCalcdata');
            spyOn(Plotly.Plots, 'style');
            spyOn(Plotly.Legend, 'draw');
        });

        function mockDefaultsAndCalc(gd) {
            Plotly.Plots.supplyDefaults(gd);
            gd.calcdata = gd._fullData.map(function(trace) {
                return [{x: 1, y: 1, trace: trace}];
            });
        }

        it('calls Scatter.arraysToCalcdata and Plots.style on scatter styling', function() {
            var gd = {
                data: [{x: [1,2,3], y: [1,2,3]}],
                layout: {}
            };
            mockDefaultsAndCalc(gd);
            Plotly.restyle(gd, {'marker.color': 'red'});
            expect(Plotly.Scatter.arraysToCalcdata).toHaveBeenCalled();
            expect(Plotly.Bars.arraysToCalcdata).not.toHaveBeenCalled();
            expect(Plotly.Plots.style).toHaveBeenCalled();
            expect(Plotly.plot).not.toHaveBeenCalled();
            // "docalc" deletes gd.calcdata - make sure this didn't happen
            expect(gd.calcdata).toBeDefined();
        });

        it('calls Bars.arraysToCalcdata and Plots.style on bar styling', function() {
            var gd = {
                data: [{x: [1,2,3], y: [1,2,3], type: 'bar'}],
                layout: {}
            };
            mockDefaultsAndCalc(gd);
            Plotly.restyle(gd, {'marker.color': 'red'});
            expect(Plotly.Scatter.arraysToCalcdata).not.toHaveBeenCalled();
            expect(Plotly.Bars.arraysToCalcdata).toHaveBeenCalled();
            expect(Plotly.Plots.style).toHaveBeenCalled();
            expect(Plotly.plot).not.toHaveBeenCalled();
            expect(gd.calcdata).toBeDefined();
        });

    });

    describe('Plotly.deleteTraces', function () {
        var gd;

        beforeEach(function () {
            gd = {
                data: [
                    {'name': 'a'},
                    {'name': 'b'},
                    {'name': 'c'},
                    {'name': 'd'}
                ]
            };
            spyOn(Plotly, 'redraw');
        });

        it('should throw an error when indices are omitted', function () {

            expect(function () {
                Plotly.deleteTraces(gd);
            }).toThrow(new Error('indices must be an integer or array of integers.'));

        });

        it('should throw an error when indices are out of bounds', function () {

            expect(function () {
                Plotly.deleteTraces(gd, 10);
            }).toThrow(new Error('indices must be valid indices for gd.data.'));

        });

        it('should throw an error when indices are repeated', function () {

            expect(function () {
                Plotly.deleteTraces(gd, [0, 0]);
            }).toThrow(new Error('each index in indices must be unique.'));

        });

        it('should work when indices are negative', function () {
            var expectedData = [
                {'name': 'a'},
                {'name': 'b'},
                {'name': 'c'}
            ];

            Plotly.deleteTraces(gd, -1);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).toHaveBeenCalled();

        });

        it('should work when multiple traces are deleted', function () {
            var expectedData = [
                {'name': 'b'},
                {'name': 'c'}
            ];

            Plotly.deleteTraces(gd, [0, 3]);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).toHaveBeenCalled();

        });

        it('should work when indices are not sorted', function () {
            var expectedData = [
                {'name': 'b'},
                {'name': 'c'}
            ];

            Plotly.deleteTraces(gd, [3, 0]);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).toHaveBeenCalled();

        });

    });

    describe('Plotly.addTraces', function () {
        var gd;

        beforeEach(function () {
            gd = {
                data: [
                    {'name': 'a'},
                    {'name': 'b'}
                ]
            };
            spyOn(Plotly, 'redraw');
            spyOn(Plotly, 'moveTraces');
        });

        it('should throw an error when traces is not an object or an array of objects', function () {
            var expected = JSON.parse(JSON.stringify(gd));
            expect(function () {
                Plotly.addTraces(gd, 1, 2);
            }).toThrow(new Error('all values in traces array must be non-array objects'));

            expect(function () {
                Plotly.addTraces(gd, [{}, 4], 2);
            }).toThrow(new Error('all values in traces array must be non-array objects'));

            expect(function () {
                Plotly.addTraces(gd, [{}, []], 2);
            }).toThrow(new Error('all values in traces array must be non-array objects'));

            // make sure we didn't muck with gd.data if things failed!
            expect(gd).toEqual(expected);

        });

        it('should throw an error when traces and newIndices arrays are unequal', function () {

            expect(function () {
                Plotly.addTraces(gd, [{}, {}], 2);
            }).toThrow(new Error('if indices is specified, traces.length must equal indices.length'));

        });

        it('should throw an error when newIndices are out of bounds', function () {
            var expected = JSON.parse(JSON.stringify(gd));

            expect(function () {
                Plotly.addTraces(gd, [{}, {}], [0, 10]);
            }).toThrow(new Error('newIndices must be valid indices for gd.data.'));

            // make sure we didn't muck with gd.data if things failed!
            expect(gd).toEqual(expected);
        });

        it('should work when newIndices is undefined', function () {
            var expectedData = [
                {'name': 'a'},
                {'name': 'b'},
                {'name': 'c'},
                {'name': 'd'}
            ];

            Plotly.addTraces(gd, [{'name': 'c'}, {'name': 'd'}]);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).toHaveBeenCalled();
            expect(Plotly.moveTraces).not.toHaveBeenCalled();

        });

        it('should work when newIndices is defined', function () {
            var expectedData = [
                {'name': 'a'},
                {'name': 'b'},
                {'name': 'c'},
                {'name': 'd'}
            ];

            Plotly.addTraces(gd, [{'name': 'c'}, {'name': 'd'}], [1, 3]);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).not.toHaveBeenCalled();
            expect(Plotly.moveTraces).toHaveBeenCalledWith(gd, [-2, -1], [1, 3]);

        });

        it('should work when newIndices has negative indices', function () {
            var expectedData = [
                {'name': 'a'},
                {'name': 'b'},
                {'name': 'c'},
                {'name': 'd'}
            ];

            Plotly.addTraces(gd, [{'name': 'c'}, {'name': 'd'}], [-3, -1]);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).not.toHaveBeenCalled();
            expect(Plotly.moveTraces).toHaveBeenCalledWith(gd, [-2, -1], [-3, -1]);

        });

        it('should work when newIndices is an integer', function () {
            var expectedData = [
                {'name': 'a'},
                {'name': 'b'},
                {'name': 'c'}
            ];

            Plotly.addTraces(gd, {'name': 'c'}, 0);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).not.toHaveBeenCalled();
            expect(Plotly.moveTraces).toHaveBeenCalledWith(gd, [-1], [0]);

        });
    });

    describe('Plotly.moveTraces should', function() {
        var gd;
        beforeEach(function () {
            gd = {
                data: [
                    {'name': 'a'},
                    {'name': 'b'},
                    {'name': 'c'},
                    {'name': 'd'}
                ]
            };
            spyOn(Plotly, 'redraw');
        });

        it('throw an error when index arrays are unequal', function () {
            expect(function () {
                Plotly.moveTraces(gd, [1], [2, 1]);
            }).toThrow(new Error('current and new indices must be of equal length.'));
        });

        it('throw an error when gd.data isn\'t an array.', function () {
            expect(function () {
                Plotly.moveTraces({}, [0], [0]);
            }).toThrow(new Error('gd.data must be an array.'));
            expect(function () {
                Plotly.moveTraces({data: 'meow'}, [0], [0]);
            }).toThrow(new Error('gd.data must be an array.'));
        });

        it('thow an error when a current index is out of bounds', function () {
            expect(function () {
                Plotly.moveTraces(gd, [-gd.data.length - 1], [0]);
            }).toThrow(new Error('currentIndices must be valid indices for gd.data.'));
            expect(function () {
                Plotly.moveTraces(gd, [gd.data.length], [0]);
            }).toThrow(new Error('currentIndices must be valid indices for gd.data.'));
        });

        it('thow an error when a new index is out of bounds', function () {
            expect(function () {
                Plotly.moveTraces(gd, [0], [-gd.data.length - 1]);
            }).toThrow(new Error('newIndices must be valid indices for gd.data.'));
            expect(function () {
                Plotly.moveTraces(gd, [0], [gd.data.length]);
            }).toThrow(new Error('newIndices must be valid indices for gd.data.'));
        });

        it('thow an error when current indices are repeated', function () {
            expect(function () {
                Plotly.moveTraces(gd, [0, 0], [0, 1]);
            }).toThrow(new Error('each index in currentIndices must be unique.'));

            // note that both positive and negative indices are accepted!
            expect(function () {
                Plotly.moveTraces(gd, [0, -gd.data.length], [0, 1]);
            }).toThrow(new Error('each index in currentIndices must be unique.'));
        });

        it('thow an error when new indices are repeated', function () {
            expect(function () {
                Plotly.moveTraces(gd, [0, 1], [0, 0]);
            }).toThrow(new Error('each index in newIndices must be unique.'));

            // note that both positive and negative indices are accepted!
            expect(function () {
                Plotly.moveTraces(gd, [0, 1], [-gd.data.length, 0]);
            }).toThrow(new Error('each index in newIndices must be unique.'));
        });

        it('accept integers in place of arrays', function () {
            var expectedData = [
                {'name': 'b'},
                {'name': 'a'},
                {'name': 'c'},
                {'name': 'd'}
            ];

            Plotly.moveTraces(gd, 0, 1);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).toHaveBeenCalled();

        });

        it('handle unsorted currentIndices', function () {
            var expectedData = [
                {'name': 'd'},
                {'name': 'a'},
                {'name': 'c'},
                {'name': 'b'}
            ];

            Plotly.moveTraces(gd, [3, 1], [0, 3]);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).toHaveBeenCalled();

        });

        it('work when newIndices are undefined.', function () {
            var expectedData = [
                {'name': 'b'},
                {'name': 'c'},
                {'name': 'd'},
                {'name': 'a'}
            ];

            Plotly.moveTraces(gd, [3, 0]);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).toHaveBeenCalled();

        });

        it('accept negative indices.', function () {
            var expectedData = [
                {'name': 'a'},
                {'name': 'c'},
                {'name': 'b'},
                {'name': 'd'}
            ];

            Plotly.moveTraces(gd, 1, -2);
            expect(gd.data).toEqual(expectedData);
            expect(Plotly.redraw).toHaveBeenCalled();

        });
    });


    describe('Plotly.ExtendTraces', function() {
        var gd;
        beforeEach(function () {
            gd = {
                data: [
                    {x: [0,1,2], marker: {size: [3,2,1]}},
                    {x: [1,2,3], marker: {size: [2,3,4]}}
                ]
            };

            if (!Plotly.Queue) {
                Plotly.Queue = {
                    add: function () {},
                    startSequence: function () {},
                    endSequence: function () {}
                };
            }

            spyOn(Plotly, 'redraw');
            spyOn(Plotly.Queue, 'add');
        });

        it('should throw an error when gd.data isn\'t an array.', function () {

            expect(function () {
                Plotly.extendTraces({}, {x: [[1]]}, [0]);
            }).toThrow(new Error('gd.data must be an array'));

            expect(function () {
                Plotly.extendTraces({data: 'meow'}, {x: [[1]]}, [0]);
            }).toThrow(new Error('gd.data must be an array'));

        });

        it('should throw an error when update is not an object', function () {

            expect(function () {
                Plotly.extendTraces(gd, undefined, [0], 8);
            }).toThrow(new Error('update must be a key:value object'));

            expect(function () {
                Plotly.extendTraces(gd, null, [0]);
            }).toThrow(new Error('update must be a key:value object'));

        });


        it('should throw an error when indices are omitted', function () {

            expect(function () {
                Plotly.extendTraces(gd, {x: [[1]]});
            }).toThrow(new Error('indices must be an integer or array of integers'));

        });

        it('should thow an error when a current index is out of bounds', function () {

            expect(function () {
                Plotly.extendTraces(gd, {x: [[1]]}, [-gd.data.length - 1]);
            }).toThrow(new Error('indices must be valid indices for gd.data.'));

        });

        it('should not thow an error when negative index wraps to positive', function () {

            expect(function () {
                Plotly.extendTraces(gd, {x: [[1]]}, [-1]);
            }).not.toThrow();

        });

       it('should thow an error when number of Indices does not match Update arrays', function () {

            expect(function () {
                Plotly.extendTraces(gd, {x: [[1, 2], [2, 3]] }, [0]);
            }).toThrow(new Error('attribute x must be an array of length equal to indices array length'));

            expect(function () {
                Plotly.extendTraces(gd, {x: [[1]]}, [0, 1]);
            }).toThrow(new Error('attribute x must be an array of length equal to indices array length'));

        });

        it('should thow an error when maxPoints is an Object but does not match Update', function () {

            expect(function () {
                Plotly.extendTraces(gd, {x: [[1]]}, [0], {y: [1]});
            }).toThrow(new Error('when maxPoints is set as a key:value object it must contain a 1:1 ' +
                                 'corrispondence with the keys and number of traces in the update object'));

            expect(function () {
                Plotly.extendTraces(gd, {x: [[1]]}, [0], {x: [1, 2]});
            }).toThrow(new Error('when maxPoints is set as a key:value object it must contain a 1:1 ' +
                                 'corrispondence with the keys and number of traces in the update object'));

        });

        it('should throw an error when update keys mismatch trace keys', function () {

            // lets update y on both traces, but only 1 trace has "y"
            gd.data[1].y = [1,2,3];

            expect(function () {
                Plotly.extendTraces(gd, {
                    y: [[3, 4], [4, 5]], 'marker.size': [[0, -1], [5, 6]]
                }, [0, 1]);
            }).toThrow(new Error('cannot extend missing or non-array attribute: y'));

        });

        it('should extend traces with update keys', function () {

            Plotly.extendTraces(gd, {
                x: [[3, 4], [4, 5]], 'marker.size': [[0, -1], [5, 6]]
            }, [0, 1]);

            expect(gd.data).toEqual([
                {x: [0,1,2,3,4], marker: {size: [3,2,1,0,-1]}},
                {x: [1,2,3,4,5], marker: {size: [2,3,4,5,6]}}
            ]);

            expect(Plotly.redraw).toHaveBeenCalled();
        });

        it('should extend and window traces with update keys', function () {
            var maxPoints = 3;

            Plotly.extendTraces(gd, {
                x: [[3, 4],[4, 5]], 'marker.size': [[0, -1],[5, 6]]
            }, [0, 1], maxPoints);

            expect(gd.data).toEqual([
                {x: [2,3,4], marker: {size: [1,0,-1]}},
                {x: [3,4,5], marker: {size: [4,5,6]}}
            ]);
        });

        it('should extend and window traces with update keys', function () {
            var maxPoints = 3;

            Plotly.extendTraces(gd, {
                x: [[3, 4], [4, 5]], 'marker.size': [[0, -1], [5, 6]]
            }, [0, 1], maxPoints);

            expect(gd.data).toEqual([
                {x: [2,3,4], marker: {size: [1,0,-1]}},
                {x: [3,4,5], marker: {size: [4,5,6]}}
            ]);
        });

        it('should extend and window traces using full maxPoint object', function () {
            var maxPoints = {x: [2, 3], 'marker.size': [1, 2]};

            Plotly.extendTraces(gd, {
                x: [[3, 4], [4, 5]], 'marker.size': [[0, -1], [5, 6]]
            }, [0, 1], maxPoints);

            expect(gd.data).toEqual([
                {x: [3,4], marker: {size: [-1]}},
                {x: [3,4,5], marker: {size: [5,6]}}
            ]);
        });

        it('should truncate arrays when maxPoints is zero', function () {

            Plotly.extendTraces(gd, {
                x: [[3, 4], [4, 5]], 'marker.size': [[0, -1], [5, 6]]
            }, [0, 1], 0);

            expect(gd.data).toEqual([
                {x: [], marker: {size: []}},
                {x: [], marker: {size: []}}
            ]);

            expect(Plotly.redraw).toHaveBeenCalled();
        });

        it('prepend is the inverse of extend - no maxPoints', function () {
            var cachedData = Plotly.Lib.extendDeep([], gd.data);

            Plotly.extendTraces(gd, {
                x: [[3, 4], [4, 5]], 'marker.size': [[0, -1], [5, 6]]
            }, [0, 1]);

            expect(gd.data).not.toEqual(cachedData);
            expect(Plotly.Queue.add).toHaveBeenCalled();

            var undoArgs = Plotly.Queue.add.calls.first().args[2];

            Plotly.prependTraces.apply(null, undoArgs);

            expect(gd.data).toEqual(cachedData);
        });


        it('extend is the inverse of prepend - no maxPoints', function () {
            var cachedData = Plotly.Lib.extendDeep([], gd.data);

            Plotly.prependTraces(gd, {
                x: [[3, 4], [4, 5]], 'marker.size': [[0, -1], [5, 6]]
            }, [0, 1]);

            expect(gd.data).not.toEqual(cachedData);
            expect(Plotly.Queue.add).toHaveBeenCalled();

            var undoArgs = Plotly.Queue.add.calls.first().args[2];

            Plotly.extendTraces.apply(null, undoArgs);

            expect(gd.data).toEqual(cachedData);
        });


        it('prepend is the inverse of extend - with maxPoints', function () {
            var maxPoints = 3;
            var cachedData = Plotly.Lib.extendDeep([], gd.data);

            Plotly.extendTraces(gd, {
                x: [[3, 4], [4, 5]], 'marker.size': [[0, -1], [5, 6]]
            }, [0, 1], maxPoints);

            expect(gd.data).not.toEqual(cachedData);
            expect(Plotly.Queue.add).toHaveBeenCalled();

            var undoArgs = Plotly.Queue.add.calls.first().args[2];

            Plotly.prependTraces.apply(null, undoArgs);

            expect(gd.data).toEqual(cachedData);
        });
    });
});
