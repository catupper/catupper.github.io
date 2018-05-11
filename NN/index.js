var NeuralNetwork = (function() {
    // Neural Network Impl
    function NN(elements) {
        this.step = 0;
        this.elements = elements;
        this.error = 0;
        this.initState();
    }

    NN.prototype.initState = function() {
        var elements = this.elements;
        var activations = this.activations = [];
        this.elements.forEach(function(num) {
            activations.push(repl(0, num));
        });

        this.weights = [];
        // this.changes = [];
        for (var l = 0; l < elements.length - 1; ++l) {
            this.weights[l] = []; // this.changes[l] = [];
            for (var i = 0; i < elements[l]; ++i) {
                this.weights[l][i] = []; // this.changes[l][i] = [];
                for (var j = 0; j < elements[l + 1]; ++j) {
                    this.weights[l][i][j] = rand(-1, 1);
                    // this.changes[l][i][j] = 0;
                }
            }
        }
    };

    NN.prototype.update = function(inputs) {
        if (inputs.length !== this.elements[0])
            throw 'Input size is wrong.';
        var l, i, j;

        for (i = 0; i < inputs.length; ++i)
            this.activations[0][i] = inputs[i];
        for (l = 0; l < this.elements.length - 1; ++l) {
            for (j = 0; j < this.elements[l + 1]; ++j) {
                var sum = 0;
                for (i = 0; i < this.elements[l]; ++i) {
                    sum += this.activations[l][i] * this.weights[l][i][j];
                }
                this.activations[l + 1][j] = sigmoid(sum);
            }
        }

        return this.activations[this.activations.length - 1];
    };

    NN.prototype.backPropagate = function(target, p) {
        if (target.length !== this.elements[this.elements.length - 1])
            throw 'Target size is wrong.';

        var act = this.activations;
        var w = this.weights;
        var l, i, j;
        var delta = [];
        for (l = 0; l < this.elements.length; ++l) {
            delta[l] = [];
            for (i = 0; i < this.elements[l]; ++i)
                delta[l][i] = 0;
        }

        // hidden -> output
        var o = this.elements.length - 1;
        for (i = 0; i < this.elements[o]; ++i) {
            delta[o][i] = (target[i] - act[o][i]) * dsigm(act[o][i]);
        }

        // hidden or input -> hidden
        for (l = this.elements.length - 2; l > 0; --l) {
            for (i = 0; i < this.elements[l]; ++i) {
                for (j = 0; j < this.elements[l + 1]; ++j) {
                    delta[l][i] += delta[l + 1][j] * w[l][i][j];
                }
                delta[l][i] *= dsigm(act[l][i]);
            }
        }

        // update weights
        for (l = 0; l < this.elements.length - 1; ++l) {
            for (i = 0; i < this.elements[l]; ++i) {
                for (j = 0; j < this.elements[l + 1]; ++j) {
                    w[l][i][j] = w[l][i][j] + p * delta[l + 1][j] * act[l][i];
                }
            }
        }

        var error = 0;
        for (i = 0; i < target.length; ++i)
            error = Math.max(Math.abs(target[i] - act[o][i]), error);
        return error;
    };

    /*
    NN.prototype.train = function(pattern, p){
        if(!this.step) this.step = 0;
        var self = this;
        return function(i){
            self.update(pattern[i][0]);
            self.backPropagate(pattern[i][1], p);
            self.step++;
        };
    };
    */

    var rand = function(a, b) { return (b - a) * Math.random() + a; };
    var repl = function(elem, times) {
        return Array.apply(null, Array(times)).map(function() { return elem; });
    };

    var sigmoid = function(x) { return 1 / (1 + Math.exp(-x)); };
    var dsigm = function(y) { return y * (1 - y); };

    return NN;
})();

var NetworkVisualizer = (function(config) {
    /*
     * Network Drawing Class
     */

    var NV = function(c, e) {
        this.canvas = c;
        this.elements = e;
        this.node = [];
        this.fibers = [];
        this.label = [];
        this.biasFibers = [];
    };

    NV.prototype.spawnNode = function(layer, index, color, text) {
        var layerNum = this.elements.length, elemsNum = this.elements[layer];
        var width = this.canvas.width, height = this.canvas.height;
        var margin = config.margin;
        var size = Math.min(20, (height - margin) / 2.5 / this.elements[layer]);
        var cx = margin + layer * (width - margin * 2) / (layerNum - 1);
        var cy = height / 2 + (index - (elemsNum - 1) / 2) * (size * 2.5);
        return [this.canvas.circle(cx, cy, size).attr({ 'stroke': color, 'stroke-width': '2' }),
            this.canvas.text(cx, cy, text).attr({ 'fill': color, 'font-size': size * 0.7 })];
    };

    NV.prototype.createNodes = function(elems) {
        for (var i = 0; i < this.elements.length; ++i) {
            this.node[i] = Array(this.elements[i]);
            this.label[i] = Array(this.elements[i]);
            for (var j = 0; j < this.elements[i]; ++j) {
                var color = (1 <= i && i <= this.elements.length - 2) ? '#666' : '#000';
                var retval = this.spawnNode(i, j, color, '###');
                this.node[i][j] = retval[0];
                this.label[i][j] = retval[1];
            }
        }
    };

    NV.prototype.connect = function(from, to) {
        return this.canvas.path(
            Raphael.format('M{0},{1}L{2},{3}',
                from.attr('cx') + from.attr('r') + 2,
                from.attr('cy'),
                to.attr('cx') - to.attr('r') - 2,
                to.attr('cy')
            )
        ).attr('stroke', '#AAA');
    };

    NV.prototype.connectAll = function() {
        var node = this.node, fibers = this.fibers;
        for (var w = 0; w < node.length - 1; ++w) {
            fibers[w] = Array(node[w]);
            for (var i = 0; i < node[w].length; ++i) {
                fibers[w][i] = Array(node[w + 1]);
                for (var j = 0; j < node[w + 1].length; ++j) {
                    fibers[w][i][j] = this.connect(node[w][i], node[w + 1][j]);
                }
            }
        }
    };

    NV.prototype.clearAll = function() {
        this.canvas.clear();
    };

    return NV;
})({
    margin: 70
});


var VisualizerController = (function() {
    /*
     * Glues NeuralNetwork to NetworkVisualizer
     */

    function VC(nn, visualizer) {
        this.network = nn;
        this.visualizer = visualizer;
    }

    VC.prototype.applyWeight = function() {
        var node = this.visualizer.node;
        for (var l = 0; l < node.length - 1; ++l) {
            for (var i = 0; i < node[l].length; ++i) {
                for (var j = 0; j < node[l + 1].length; ++j) {
                    this.visualizer.fibers[l][i][j].attr(
                        this.getFiberAttr(this.network.weights[l][i][j])
                    );
                }
            }
        }
    };

    VC.prototype.applyActivation = function(weight) {
        var node = this.visualizer.node;
        for (var l = 0; l < node.length; ++l) {
            for (var i = 0; i < node[l].length; ++i) {
                this.visualizer.label[l][i].attr('text', this.network.activations[l][i].toFixed(2));
                if (l === node.length - 1 || l === 0) {
                    this.visualizer.node[l][i].attr(
                        'fill', Raphael.hsb2rgb(0, 0, 1 - this.network.activations[l][i])
                    );
                    this.visualizer.label[l][i].attr(
                        'fill', Raphael.hsb2rgb(0, 0, this.network.activations[l][i] > 0.5 ? 1: 0)
                    );
                }
            }
        }
    };

    VC.prototype.getFiberAttr = function(weight) {
        return {
            'stroke' : weight >= 0 ? '#FF7F7F' : '#7f7fFF',
            'stroke-dasharray' : weight >= 0 ? '' : '-',
            'stroke-width' : Math.sqrt(Math.abs(weight))
        };
    };

    return VC;
})();


var DemoBase = (function() {
    /*
     * Base Class of Demo
     */

    function DB(index, layer, dataset) {
        this.timer = -1;
        this.layer = layer;
        this.visualizer = null;
        this.dataset = dataset;
        this.speed = $('input[name=speed]:checked').val() | 0;
        this.init(index);
        this.reset();
    }

    DB.prototype.init = function(index) {
        $('.demofield').hide();
        $('#demo' + index).show();
        $('#hlayers').val(this.layer.slice(1, this.layer.length - 1));

        this.visualizer = new NetworkVisualizer(Raphael('network'), this.layer);
        this.network = new NeuralNetwork(this.layer);
        this.controller = new VisualizerController(this.network, this.visualizer);

        this.visualizer.createNodes();
        this.visualizer.connectAll();
    };

    DB.prototype.reset = function() {
        this.state = DB.State.BEFORE_TRAIN;
        clearInterval(this.timer);
        $('#train').val('学習開始');
        $('#step-output').html('0');
        $('#error-output').html('0');
        this.network.initState();
        this.controller.applyActivation();
        this.controller.applyWeight();
    };

    DB.prototype.startTraining = function() {
        this.beforeTraining();
        this.state = DB.State.TRAINING;
        this.lr = parseFloat($('#rl').val());
        if ($('input[name=endcond]:checked').val() === 'steps') {
            this.ecStep = parseInt($('#step').val());  // end condition: step
            this.ecError = -1;  // end condition: error
        }else {
            this.ecStep = Number.MAX_VALUE;  // end condition: step
            this.ecError = parseFloat($('#error').val());  // end condition: error
        }
        this.step = 0;
        this.counter = 0;
        this.error = [];
        this.timer = setInterval(this.tick.bind(this), 15);
    };

    DB.prototype.finishTraining = function() {
        clearInterval(this.timer);
        this.state = DB.State.TRAINED;
        $('#train').val('再学習');
        this.afterTraining();
    };

    DB.prototype.tick = function() {
        var i;
        var pattern = this.dataset;
        if (this.speed <= 1) {
            if (this.speed === 0 && this.counter++ % 50 !== 0) return;
            i = this.step % pattern.length;
            this.network.update(pattern[i][0]);
            this.error[i] = this.network.backPropagate(pattern[i][1], this.lr);
            this.controller.applyActivation();
            this.controller.applyWeight();
            this.step++;
            if (this.ecStep <= this.step || (this.ecError >= 0 && i === pattern.length - 1 && this.ecError > Math.max.apply(null, this.error))) {
                this.finishTraining();
            }
        } else {
            var epoch = Math.pow(10, this.speed - 1);
            OUTER: for (var n = 0; n < epoch; ++n) {
                for (i = 0; i < pattern.length; ++i) {
                    this.network.update(pattern[i][0]);
                    this.error[i] = this.network.backPropagate(pattern[i][1], this.lr);
                    this.step++;
                    if (this.ecStep <= this.step || (this.ecError >= 0 && i === pattern.length - 1 && this.ecError > Math.max.apply(null, this.error))) {
                        this.finishTraining();
                        break OUTER;
                    }
                }
            }
            this.controller.applyWeight();
            this.network.update(pattern[this.counter++ % pattern.length][0]);
            this.controller.applyActivation();
        }

        this.onTick();
        $('#step-output').html(this.step);
        $('#error-output').html(Math.max.apply(null, this.error));
    };

    DB.prototype.pauseTraining = function() {
        this.state = DB.State.PAUSE;
        clearInterval(this.timer);
    };

    DB.prototype.resumeTraining = function() {
        this.state = DB.State.TRAINING;
        this.timer = setInterval(this.tick.bind(this), 15);
    };

    DB.State = {
        BEFORE_TRAIN: 0,
        TRAINING: 1,
        PAUSE: 2,
        TRAINED: 3
    };

    DB.prototype.state = DB.State.BEFORE_TRAIN;
    DB.prototype.beforeTraining = function() {};
    DB.prototype.afterTraining = function() {};
    DB.prototype.onTick = function() {};

    DB.prototype.disableParams = function() {
        $('.param input:not([name=speed])').attr('disabled', 'disabled');
    };

    DB.prototype.enableParams = function() {
        $('.param input').removeAttr('disabled');
    };

    DB.prototype.deinit = function() {
        clearInterval(this.timer);
        this.visualizer.clearAll();
        this.visualizer = this.network = this.controller = null;
    };

    DB.prototype.makeLayers = function(hlayer, input, output, defaultLayer) {
        if (!hlayer || !hlayer.length) hlayer = defaultLayer;
        hlayer.unshift(input);
        hlayer.push(output);
        return hlayer;
    };

    return DB;
})();

var Demos = [];

Demos[0] = null; // missing number


Demos[1] = (function() {
    /*
     * Demo 1: XOR
     */

    function XOR(hlayer) {
        DemoBase.call(this, '1', this.makeLayers(hlayer, 3, 1, [4, 4]), [
            [[0, 0, 0], [0]],
            [[0, 0, 1], [1]],
            [[0, 1, 0], [1]],
            [[0, 1, 1], [0]],
            [[1, 0, 0], [1]],
            [[1, 0, 1], [0]],
            [[1, 1, 0], [0]],
            [[1, 1, 1], [1]]
        ]);
        if (!XOR.prepared) XOR.prepare();
    }
    XOR.prepared = false;

    XOR.prepare = function(){
        $('.test-xor').click(function() {
            if (this.state !== DemoBase.State.TRAINING) {
                var num = $(this).data('input');
                var input = [(num >> 2) & 1, (num >> 1) & 1, num & 1];
                demo.network.update(input);
                demo.controller.applyActivation();
            }
        });
        XOR.prepared = true;
    };

    XOR.prototype = Object.create(DemoBase.prototype);
    XOR.prototype.constructor = DemoBase;

    return XOR;
})();


Demos[2] = (function() {
    /*
     * Demo 2: Functional Approximation
     */

    function Approx(hlayer) {
        this.plot = Raphael('plot', 400, 300);
        this.width = 400;
        this.height = 300;

        var dataset = this.makeDataset(0, 20);
        DemoBase.call(this, '2', this.makeLayers(hlayer, 2, 1, [6, 6, 6]), dataset);

        if(!Approx.prepared) Approx.prepare();

        this.resetField(this.dataset);
    }

    Approx.prepared = false;
    Approx.prototype = Object.create(DemoBase.prototype);
    Approx.prototype.constructor = DemoBase;

    Approx.prepare = function(){
        $('#functype').change(function(e) {
            var index = $('#functype option:selected').val() | 0;
            var k = 20;
            if(index === 3) { // random 
                k = 6;
                $('#regen-random').show();
            } else {
                $('#regen-random').hide();
            }
            demo.dataset = demo.makeDataset(index, k);
            demo.reset();
            demo.resetField(demo.dataset);
        });
        $('#regen-random').hide();
        $('#regen-random').click(function(){
            var index = $('#functype option:selected').val() | 0;
            if(index === 3) {
                demo.dataset = demo.makeDataset(index, 6);
                demo.resetField(demo.dataset);
            }
        });
    };

    Approx.Form = [
        function(x) { return (Math.sin(2 * Math.PI * x) + 1) / 2; }, // Sine Function
        function(x) { return Math.abs(x - 1 / 2) * 2; }, // Valley
        function(x) {
            if (Math.abs(x - 0.5) < 0.01) return 1 / 2;
            if (x < 0.5) return 0;
            if (x > 0.5) return 1;
        },// Step Function
        function(x) {
            return Math.random();
        } // Random Function
    ];

    Approx.prototype.transform = function(point) {
        return [point[0] * this.width, (1 - point[1]) * (this.height - 50) + 25];
    };

    Approx.prototype.makeDataset = function(index, k) {
        var f = Approx.Form[index];
        var data = [];
        for (var i = 0; i <= k; ++i) {
            data[i] = [[i / k, 1], [f(i / k)]];
        }
        return data;
    };

    Approx.prototype.plotPoints = function(points) {
        for (var i = 0; i < points.length; ++i) {
            var p = this.transform(points[i]);
            this.plot.circle(p[0], p[1], 3).attr({
                'fill': 'blue',
                'stroke-width' : 0
            });
        }
    };

    Approx.prototype.plotFunction = function(f, lb, ub, step) {
        var transform = this.transform.bind(this);
        function getPath(x1, x2) {
            var y1 = f(x1), y2 = f(x2);
            var x0 = (x1 + x2) / 2;
            var y0 = 2 * f(x0) - (y1 + y2) / 2;
            return 'M'+ transform([x1, y1]).join(',') +
                   'Q'+
                   transform([x0, y0]).join(',') + ' ' +
                   transform([x2, y2]).join(',');
        }
        var str = '';
        var dx = (ub - lb) / step;
        for (var n = 0; n < step; ++n) {
            str += getPath(n * dx + lb, (n + 1) * dx + lb);
        }
        return this.plot.path(str).attr('stroke', 'red');
    };

    Approx.prototype.onTick = function() {
        var self = this;
        this.curve.remove();
        this.curve = this.plotFunction(function(x) {
            return self.network.update([x, 1])[0];
        },0, 1, 20);
    };

    Approx.prototype.reset = function() {
        if (this.curve) this.curve.remove();
        DemoBase.prototype.reset.call(this);
    };

    Approx.prototype.resetField = function(dataset) {
        this.plot.clear();
        this.plotPoints(dataset.map(function(a) { return [a[0][0], a[1][0]]; }));
    };

    Approx.prototype.beforeTraining = function() {
        var self = this;
        if (!!this.curve) this.curve.remove();
        this.curve = this.plotFunction(function(x) {
            return self.network.update([x, 1])[0];
        },0, 1, 20);
    };

    Approx.prototype.deinit = function() {
        this.plot.remove();
        DemoBase.prototype.deinit.call(this);
    };

    return Approx;
})();


Demos[3] = (function() {
    /*
     * Demo 3: Pattern Recognition
     */

    function Recognition(hlayer) {

        // make datasets
        var dataset = Recognition.Digits.map(function(e, i) {
            var output = repl(0, 10);
            output[i] = 1;
            return [e, output];
        });

        // Add extra data
        dataset = dataset.concat(Recognition.extraDataset.map(function(e) {
            var output = repl(0, 10);
            output[1] = 1;
            return [e, output];
        }));

        if(!Recognition.prepared) Recognition.prepare();

        DemoBase.call(this, '3', this.makeLayers(hlayer, 15, 10, [30]), dataset);
    }

    Recognition.prepared = false;
    Recognition.prototype = Object.create(DemoBase.prototype);
    Recognition.prototype.constructor = DemoBase;

    Recognition.prepare = function(){

        $('#panel td').click(function() {
            $(this).toggleClass('on');
        });
        $('.pat-num').click(function() {
            demo.setPattern(Recognition.Digits[this.value | 0]);
        });
        $('#clear').click(function() {
            demo.setPattern([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        });

        $('#recog').click(function() {
            var input = demo.getPattern();
            var result = demo.network.update(input);
            demo.controller.applyActivation();

            var max_i = 0, max = -1;
            for (var i = 0; i < result.length; ++i) {
                if (max <= result[i]) {
                    max_i = i;
                    max = result[i];
                }
            }
            $('#pat-output').html(max_i);
        });

        Recognition.prepared = true;
    };

    Recognition.prototype.setPattern = function(pattern) {
        $('#panel td').each(function(index) {
            if (pattern[index])
                $(this).addClass('on');
            else
                $(this).removeClass('on');
        });
    };

    Recognition.prototype.getPattern = function(pattern) {
        var arr = [];
        $('#panel td').each(function(index) {
            arr[index] = $(this).hasClass('on') * 1;
        });
        return arr;
    };

    Recognition.Digits = [
        [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
        [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1]
    ];

    Recognition.extraDataset = [
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
    ];

    var repl = function(elem, times) {
        return Array.apply(null, Array(times)).map(function() { return elem; });
    };

    return Recognition;
})();



Demos[4] = (function() {
    /*
     * Demo 4: Pattern Recognition
     */

    function Recognition(hlayer) {

        // make datasets
        var dataset = Recognition.Digits.map(function(e, i) {
            var output = repl(0, 10);
            output[i] = 1;
            return [e, output];
        });

        // Add extra data
        dataset = dataset.concat(Recognition.extraDataset.map(function(e) {
            var output = repl(0, 10);
            output[1] = 1;
            return [e, output];
        }));

        if(!Recognition.prepared) Recognition.prepare();

        DemoBase.call(this, '3', this.makeLayers(hlayer, 15, 10, [30]), dataset);
    }

    Recognition.prepared = false;
    Recognition.prototype = Object.create(DemoBase.prototype);
    Recognition.prototype.constructor = DemoBase;

    Recognition.prepare = function(){

        $('#panel td').click(function() {
            $(this).toggleClass('on');
        });
        $('.pat-num').click(function() {
            demo.setPattern(Recognition.Digits[this.value | 0]);
        });
        $('#clear').click(function() {
            demo.setPattern([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        });

        $('#recog').click(function() {
            var input = demo.getPattern();
            var result = demo.network.update(input);
            demo.controller.applyActivation();

            var max_i = 0, max = -1;
            for (var i = 0; i < result.length; ++i) {
                if (max <= result[i]) {
                    max_i = i;
                    max = result[i];
                }
            }
            $('#pat-output').html(max_i);
        });

        Recognition.prepared = true;
    };

    Recognition.prototype.setPattern = function(pattern) {
        $('#panel td').each(function(index) {
            if (pattern[index])
                $(this).addClass('on');
            else
                $(this).removeClass('on');
        });
    };

    Recognition.prototype.getPattern = function(pattern) {
        var arr = [];
        $('#panel td').each(function(index) {
            arr[index] = $(this).hasClass('on') * 1;
        });
        return arr;
    };

    Recognition.Digits = [
        [1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
        [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1]
    ];

    Recognition.extraDataset = [
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
    ];

    var repl = function(elem, times) {
        return Array.apply(null, Array(times)).map(function() { return elem; });
    };

    return Recognition;
})();


// main script

var demo = null;

$(document).ready(function() {

    $('#demos').change(function() {
        var num = $('#demos option:selected').val() | 0;
        demo.deinit();
        demo = new Demos[num]();
        location.hash = num;
    });

    $('#changelayer').click(function() {
        var layer = $('#hlayers').val().split(',').map(function(i) { return i | 0; });
        var num = $('#demos option:selected').val() | 0;
        demo.deinit();
        demo = new Demos[num](layer);
    });

    $('input[type=range]').mousemove(function() {
        $('#' + this.id + 'view').html(this.value);
    });

    $('#init').click(function() {
        demo.reset();
    });

    $('#train').click(function() {
        var button = $(this);
        switch (demo.state) {
        case DemoBase.State.BEFORE_TRAIN:
        case DemoBase.State.TRAINED:
            demo.startTraining();
            button.val('停止');
            break;
        case DemoBase.State.TRAINING:
            demo.pauseTraining();
            button.val('再開');
            break;
        case DemoBase.State.PAUSE:
            demo.resumeTraining();
            button.val('停止');
            break;
        }
    });

    $('input[name=speed]').change(function() {
        demo.speed = this.value | 0;
    });

    var demosNum = location.hash.slice(1) | 0;
    if (demosNum < 1 || demosNum > 3) demosNum = 1;
    demo = new Demos[demosNum]();
    $('#demos').val(demosNum);
});
