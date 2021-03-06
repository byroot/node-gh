/*
 * Copyright 2013 Eduardo Lundgren, All Rights Reserved.
 *
 * Code licensed under the BSD License:
 * https://github.com/eduardolundgren/blob/master/LICENSE.md
 *
 * @author Eduardo Lundgren <eduardolundgren@gmail.com>
 */

var base = require('./base'),
    git = require('git-wrapper'),
    toArray;

toArray = Array.prototype.slice;

exports.git = new git();

exports.checkout = function(branch, opt_newBranch, opt_callback) {
    var args;

    args = [ branch ];

    if (opt_newBranch) {
        args.push('-B', opt_newBranch);
    }

    exports.exec('checkout', args, function(err, data) {
        opt_callback && opt_callback(err, data);
    });
};

exports.exec = function() {
    var args;

    args = toArray.call(arguments);

    if (typeof args[args.length - 1] !== 'function') {
        args.push(function() {});
    }

    exports.git.exec.apply(exports.git, args);
};

exports.findRoot = function(opt_callback) {
    exports.exec('rev-parse', ['--show-toplevel'], function(err, data) {
        opt_callback(err, data.trim());
    });
};

exports.getCurrentBranch = function(opt_callback) {
    exports.exec('symbolic-ref', ['HEAD'], function(err, data) {
        data = data.substring(data.lastIndexOf('/') + 1);
        opt_callback(err, data.trim());
    });
};

exports.getOriginURL = function(opt_callback) {
    exports.exec('config', ['--get', 'remote.origin.url'], function(err, data) {
        opt_callback(err, data.trim());
    });
};

exports.getRepositoryName = function(opt_callback) {
    var end,
        gitLastIndex;

    exports.getOriginURL(function(err, data) {
        gitLastIndex = data.lastIndexOf('.git');
        end = (gitLastIndex > -1) ? gitLastIndex : data.length;

        data = data.substring(data.lastIndexOf('/') + 1, gitLastIndex);

        opt_callback(err, data);
    });
};

exports.merge = function(branch, rebase, abort, opt_callback) {
    var type;

    type = rebase ? 'rebase' : 'merge';

    exports.exec(type, [ branch ], function(err, data) {
        if (err) {
            console.log(data);

            if (abort) {
                exports.exec(type, [ '--abort' ], function() {
                    base.logger.error('unable to ' + type);
                });
            }
            return;
        }
        opt_callback && opt_callback(err, data);
    });
};