'use strict';

var $ = require('jquery');
var Editor = require('./../editor/editor');
var ColumnsEditor = require('../columnsEditor');

/**
 * An editor which render a button.
 * Does nothing by default: you must implements <b>transformValues</b>
 * in order to perform the changes each time the button is clicked
 */
var ButtonField = {

    /**
     * Creates the button
     * @returns {ButtonField} Editor
     */
    create: function () {
        this.$button = $('<button/>', $.extend({
            'class': 'btn btn-default columns-editor-button',
            'text': 'click-me'
        }, this.buttonAttrs));

        return this.$button;
    },

    /**
     * Listen for button's click event
     */
    notifyOpen: function () {
        $('.columns-editor-button', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.onClick();
            }.bind(this));
    },

    /**
     * Triggered each time the button is clicked
     */
    onClick: function () {
        this.notifyChange();
    }
};

ColumnsEditor.prototype.fields.button = function(settings) {
    return $.extend({}, Editor, ButtonField, settings);
};

module.exports = ButtonField;
