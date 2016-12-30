'use strict';

var $ = require('jquery');

var BaseEditor = {
    init: function ($header) {
        var self = this;
        this.$dom = $header;

        var editButton = $('<button/>', {
            'class': 'btn btn-link pull-right columns-edit-button'
        });
        editButton.append($('<img/>', $.extend({
                src: this.editImg
            }, this.editButtonAttrs)
        ));

        var editor = this.create();

        this.$dom
            .append(editButton)
            .append(editor);

        editButton.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.notifyOpen();
        });
    },

    create: function () {},

    open: function () {
        $('.columns-edit-button', this.$dom).hide();
        $('.columns-editor', this.$dom).show();
    },

    close: function () {
        $('.columns-editor', this.$dom).hide();
        $('.columns-edit-button', this.$dom).show();
    },

    notifyOpen: function () {},

    notifyClose: function () {
        this.close();
    },

    notifyChange: function () {
        this.$dom.trigger('update.editors.dt', {
            editor: this
        });
    },

    register: function (callback) {
        this.$dom.on('update.editors.dt', callback);
    }

};

module.exports = BaseEditor;