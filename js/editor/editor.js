'use strict';

var $ = require('jquery');

/**
 * An editor which toggles its field
 * @type {{Editor}}
 */
var Editor = {

    /**
     * Initializes the editor by inserting into the <b>$header</b> the component
     * Creates the editor button and call the real editor's implementation
     * in order to add it into the DOM
     *
     * @see create
     * @param {$} $header the header's column where to add the editor
     */
    init: function ($header) {
        var self = this;
        this.$dom = $header;

        // Wrap the column's header into a span
        var label = this.$dom.text();
        this.$headerLabel = $('<span/>', {
            class: 'columns-header-label',
            text: label
        });

        // Create the toggle buttons
        this.$openButton = $('<button/>', {
            'class': 'columns-edit-button columns-edit-open'
        }).append($('<img/>', $.extend({
            src: '../img/edit.png'
        }, this.openButtonAttrs)));

        this.$closeButton = $('<button/>', {
            'class': 'columns-edit-button columns-edit-close'
        }).append($('<img/>', {
            src: '../img/back.png'
        })).hide();


        // Create the field,
        // and wrap it into a span
        this.$fieldContainer = $('<span/>', {
            'class': 'columns-editor'
        })
            .append(this.create())
            .hide();

        this.$dom
            .empty()
            .append(this.$headerLabel)
            .append(this.$fieldContainer)
            .append(this.$openButton)
            .append(this.$closeButton),

        this.$openButton.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.open();
            self.notifyOpen();
        });

        this.$closeButton.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.close();
        });
    },

    /**
     * shows the real editor implementation
     */
    open: function () {
        this.$openButton.hide();
        this.$headerLabel.hide();

        this.$closeButton.show();
        this.$fieldContainer.show();
    },

    /**
     * hides the real editor implementation
     */
    close: function () {
        this.$closeButton.hide();
        this.$fieldContainer.hide();

        this.$headerLabel.show();
        this.$openButton.show();
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

module.exports = Editor;
