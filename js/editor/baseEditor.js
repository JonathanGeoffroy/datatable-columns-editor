'use strict';

var $ = require('jquery');

/**
 * An abstract Editor that manages the DOM for any editor.
 * it Adds button which toggle the real editor.
 *
 * It also provides events and interface to interact with the ColumnsEditor
 */
var BaseEditor = {
    /**
      * Initializes the editor by inserting into the <b>$header</b> the component
      * Creates the editor button and call the real editor's implementation
      * in order to add it into the DOM
      *
      * @see create
      * @param {jquery} $header the header's column where to add the editor
      */
    init: function ($header) {
        var self = this;
        this.$dom = $header;

        var editButton = $('<button/>', {
            'class': 'btn btn-link pull-right columns-edit-button'
        });
        editButton.append($('<img/>', $.extend({
            src: '../img/edit.png'
        }, this.editButtonAttrs)));

        var editor = this.create();

        this.$dom
            .append(editButton)
            .append(editor);

        editButton.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.open();
            self.notifyOpen();
        });
    },

    /**
     * shows the real editor implementation
     */
    open: function () {
        $('.columns-edit-button', this.$dom).hide();
        $('.columns-editor', this.$dom).show();
    },

    /**
     * hides the real editor implementation
     */
    close: function () {
        $('.columns-editor', this.$dom).hide();
        $('.columns-edit-button', this.$dom).show();
    },

    /**
     * Notify that the editor is open
     */
    notifyOpen: function () {},

    /**
     * Notify that the editor changed
     */
    notifyChange: function () {
        this.onValueChanged();
        this.close();
        this.$dom.trigger('update.editors.dt', {
            editor: this
        });
    },

    /**
     * Trigger called as soon as the values has been transformed by the editors
     * @see transformValues
     */
    onValueChanged: function () {},


    /**
     * register a callback called each time the editor's value changes
     * @param {function} callback the callback to call on each editor's change
     */
    register: function (callback) {
        this.$dom.on('update.editors.dt', callback);
    }
};

module.exports = BaseEditor;
