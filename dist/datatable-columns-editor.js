(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

/**
 * ColumnsEditor is a component that manages a list of filters indside
 * a datatable header row.
 *
 * This constructor binds listeners to various datatable events.
 *
 * @param {Object} settings object used to create the datatable
 */
var ColumnsEditor = function (settings) {
    this.tableAPI = new $.fn.dataTable.Api(settings);
    this.$header = $(this.tableAPI.table().header());
    this.settings = settings;

    var editors = settings.aoColumns.filter(function (column) {
        return column.editor;
    })
    .map(function (param) {
        var options = $.extend({
            column: param.idx,
            property: param.data
        }, param.editor);

        return this.fields[param.editor.type](options);
    }, this);

    if(editors.length > 0) {
        this.editors = editors;
        this.tableAPI.on('init', this.onDataTableInit.bind(this));
    }
};

$.extend(ColumnsEditor.prototype, {

    /**
     * Array of field constructor function. Each function
     * takes a setting object as its single parameter
     */
    fields: {},

    /**
     * Initialize all editors and add them into datatable header
     * It also registers the main event handler that will react to the editor'
     * value changes.
     *
     * The event name is <b>update.editors.dt</b>. This event must be triggered by the
     * editors when their value is modified by the user (or any other event that
     * should trigger a datatable filter).
     *
     * @returns {ColumnsEditor} the ColumnsEditor object
     */
    setupHeaderRow: function () {
        this.editors.forEach(function (editor) {
            editor.init($(this.tableAPI.column(editor.column).header()));
            editor.register($.proxy(this.transformValues, this));
        }, this);

        return this;
    },

    /**
     * Redraws the dataTable
     *
     * @returns {ColumnsEditor} the ColumnsEditor object
     */
    drawTable: function () {
        this.tableAPI.draw();

        return this;
    },

    /**
     * Actions to execute when the dataTable is done initializing.
     * Create and add  all editors into the dataTable header
     *
     * @returns {ColumnsEditor} the ColumnsEditor object
     */
    onDataTableInit: function () {
        this.setupHeaderRow();

        return this;
    },

    /**
     * Transform values of the entire dataTable
     * Ask to the editor that has changed to transform data,
     * and then re-render the dataTable
     *
     * @param {Event} event triggered Event
     * @param {object} params editor's params
     * @returns {ColumnsEditor} the ColumnsEditor object
     */
    transformValues: function (event, params) {
        var newValues = params.editor.transformValues(this.tableAPI.data().toArray());
        this.tableAPI.clear().rows.add(newValues);
        this.drawTable();

        return this;
    }
});

$(document).on('preInit.dt', function (e, settings) {
    new ColumnsEditor(settings);
});

module.exports = ColumnsEditor;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var editor = require('./editor');

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
            'class': 'columns-edit-button'
        }).append($('<img/>', $.extend({
            src: '../img/edit.png'
        }, this.openButtonAttrs)));

        this.$closeButton = $('<button/>', {
            'class': 'columns-edit-button'
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./editor":2}],3:[function(require,module,exports){
(function (global){
'use strict';

var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../columnsEditor":1,"./../editor/editor":2}],4:[function(require,module,exports){
var Field = {

    /**
     * Set each cell to the input's value.
     * Only changes a cell's value if <b>canChangeValue</b> returns true for the provided cell
     * @param {Array} dataRows the entire DataTable's dataset
     * @returns {Array} the same dataRows, but with values changed
     */
    transformValues: function (dataRows) {
        var newValue = this.getValue();

        return dataRows.map(function (row, index) {
            if (this.canChangeValue(row[this.property], index, row)) {
                row[this.property] = newValue;
            }

            return row;
        }.bind(this));
    },

    /**
     * Specify if a cell is editable
     * In this implementation, always returns true.
     * Can be override in order to choose which cells can be changed
     *
     * @return {boolean} always true
     */
    canChangeValue: function () {
        return true;
    }
};

module.exports = Field;

},{}],5:[function(require,module,exports){
(function (global){
'use strict';

var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var Field = require('./field');
var Editor = require('../editor/editor');
var ColumnsEditor = require('../columnsEditor');

/**
 * An editor which render an input text,
 * and set all column's cells to the input's value when user validates
 */
var InputField = {

    /**
     * Creates the input and its validation button
     * @returns {InputField} InputField
     */
    create: function () {
        this.$container = $('<span/>');
        this.$input = $('<input/>', $.extend({
            'class': 'columns-input-input'
        }, this.inputAttrs));

        this.$editorButton = $('<button/>', $.extend({
            'class': 'columns-input-button',
            'text': 'OK'
        }, this.validateButtonAttrs));

        this.$container
            .append(this.$input)
            .append(this.$editorButton);

        return this.$container;
    },

    /**
     * listen for input changes
     */
    notifyOpen: function () {
        this.$input
            // Prevent from sorting column when user clicks on input
            .click(function(event) {
                event.stopPropagation();
            })
            .keypress(function (event) {
                event.stopPropagation();
                switch (event.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'Enter':
                    this.notifyChange();
                    break;
                }
            }.bind(this))
            .focus();

        $('.columns-editor-inputbutton', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.notifyChange();
            }.bind(this));
    },

    /**
     *
     * @returns {string} the field's value
     */
    getValue: function () {
        return this.$input.val();
    }
};

ColumnsEditor.prototype.fields.input = function(settings) {
    return $.extend({}, Editor, Field, InputField, settings);
};

module.exports = InputField;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../columnsEditor":1,"../editor/editor":2,"./field":4}],6:[function(require,module,exports){
'use strict';

require('./editor/editor');
require('./field/input');
require('./field/button');
require('./columnsEditor');

},{"./columnsEditor":1,"./editor/editor":2,"./field/button":3,"./field/input":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb2x1bW5zRWRpdG9yLmpzIiwianMvZWRpdG9yL2VkaXRvci5qcyIsImpzL2ZpZWxkL2J1dHRvbi5qcyIsImpzL2ZpZWxkL2ZpZWxkLmpzIiwianMvZmllbGQvaW5wdXQuanMiLCJqcy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xuXG4vKipcbiAqIENvbHVtbnNFZGl0b3IgaXMgYSBjb21wb25lbnQgdGhhdCBtYW5hZ2VzIGEgbGlzdCBvZiBmaWx0ZXJzIGluZHNpZGVcbiAqIGEgZGF0YXRhYmxlIGhlYWRlciByb3cuXG4gKlxuICogVGhpcyBjb25zdHJ1Y3RvciBiaW5kcyBsaXN0ZW5lcnMgdG8gdmFyaW91cyBkYXRhdGFibGUgZXZlbnRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXR0aW5ncyBvYmplY3QgdXNlZCB0byBjcmVhdGUgdGhlIGRhdGF0YWJsZVxuICovXG52YXIgQ29sdW1uc0VkaXRvciA9IGZ1bmN0aW9uIChzZXR0aW5ncykge1xuICAgIHRoaXMudGFibGVBUEkgPSBuZXcgJC5mbi5kYXRhVGFibGUuQXBpKHNldHRpbmdzKTtcbiAgICB0aGlzLiRoZWFkZXIgPSAkKHRoaXMudGFibGVBUEkudGFibGUoKS5oZWFkZXIoKSk7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNldHRpbmdzO1xuXG4gICAgdmFyIGVkaXRvcnMgPSBzZXR0aW5ncy5hb0NvbHVtbnMuZmlsdGVyKGZ1bmN0aW9uIChjb2x1bW4pIHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbi5lZGl0b3I7XG4gICAgfSlcbiAgICAubWFwKGZ1bmN0aW9uIChwYXJhbSkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHtcbiAgICAgICAgICAgIGNvbHVtbjogcGFyYW0uaWR4LFxuICAgICAgICAgICAgcHJvcGVydHk6IHBhcmFtLmRhdGFcbiAgICAgICAgfSwgcGFyYW0uZWRpdG9yKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5maWVsZHNbcGFyYW0uZWRpdG9yLnR5cGVdKG9wdGlvbnMpO1xuICAgIH0sIHRoaXMpO1xuXG4gICAgaWYoZWRpdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuZWRpdG9ycyA9IGVkaXRvcnM7XG4gICAgICAgIHRoaXMudGFibGVBUEkub24oJ2luaXQnLCB0aGlzLm9uRGF0YVRhYmxlSW5pdC5iaW5kKHRoaXMpKTtcbiAgICB9XG59O1xuXG4kLmV4dGVuZChDb2x1bW5zRWRpdG9yLnByb3RvdHlwZSwge1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2YgZmllbGQgY29uc3RydWN0b3IgZnVuY3Rpb24uIEVhY2ggZnVuY3Rpb25cbiAgICAgKiB0YWtlcyBhIHNldHRpbmcgb2JqZWN0IGFzIGl0cyBzaW5nbGUgcGFyYW1ldGVyXG4gICAgICovXG4gICAgZmllbGRzOiB7fSxcblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgYWxsIGVkaXRvcnMgYW5kIGFkZCB0aGVtIGludG8gZGF0YXRhYmxlIGhlYWRlclxuICAgICAqIEl0IGFsc28gcmVnaXN0ZXJzIHRoZSBtYWluIGV2ZW50IGhhbmRsZXIgdGhhdCB3aWxsIHJlYWN0IHRvIHRoZSBlZGl0b3InXG4gICAgICogdmFsdWUgY2hhbmdlcy5cbiAgICAgKlxuICAgICAqIFRoZSBldmVudCBuYW1lIGlzIDxiPnVwZGF0ZS5lZGl0b3JzLmR0PC9iPi4gVGhpcyBldmVudCBtdXN0IGJlIHRyaWdnZXJlZCBieSB0aGVcbiAgICAgKiBlZGl0b3JzIHdoZW4gdGhlaXIgdmFsdWUgaXMgbW9kaWZpZWQgYnkgdGhlIHVzZXIgKG9yIGFueSBvdGhlciBldmVudCB0aGF0XG4gICAgICogc2hvdWxkIHRyaWdnZXIgYSBkYXRhdGFibGUgZmlsdGVyKS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtDb2x1bW5zRWRpdG9yfSB0aGUgQ29sdW1uc0VkaXRvciBvYmplY3RcbiAgICAgKi9cbiAgICBzZXR1cEhlYWRlclJvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVkaXRvcnMuZm9yRWFjaChmdW5jdGlvbiAoZWRpdG9yKSB7XG4gICAgICAgICAgICBlZGl0b3IuaW5pdCgkKHRoaXMudGFibGVBUEkuY29sdW1uKGVkaXRvci5jb2x1bW4pLmhlYWRlcigpKSk7XG4gICAgICAgICAgICBlZGl0b3IucmVnaXN0ZXIoJC5wcm94eSh0aGlzLnRyYW5zZm9ybVZhbHVlcywgdGhpcykpO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVkcmF3cyB0aGUgZGF0YVRhYmxlXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Q29sdW1uc0VkaXRvcn0gdGhlIENvbHVtbnNFZGl0b3Igb2JqZWN0XG4gICAgICovXG4gICAgZHJhd1RhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudGFibGVBUEkuZHJhdygpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBY3Rpb25zIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZGF0YVRhYmxlIGlzIGRvbmUgaW5pdGlhbGl6aW5nLlxuICAgICAqIENyZWF0ZSBhbmQgYWRkICBhbGwgZWRpdG9ycyBpbnRvIHRoZSBkYXRhVGFibGUgaGVhZGVyXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Q29sdW1uc0VkaXRvcn0gdGhlIENvbHVtbnNFZGl0b3Igb2JqZWN0XG4gICAgICovXG4gICAgb25EYXRhVGFibGVJbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0dXBIZWFkZXJSb3coKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVHJhbnNmb3JtIHZhbHVlcyBvZiB0aGUgZW50aXJlIGRhdGFUYWJsZVxuICAgICAqIEFzayB0byB0aGUgZWRpdG9yIHRoYXQgaGFzIGNoYW5nZWQgdG8gdHJhbnNmb3JtIGRhdGEsXG4gICAgICogYW5kIHRoZW4gcmUtcmVuZGVyIHRoZSBkYXRhVGFibGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IHRyaWdnZXJlZCBFdmVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgZWRpdG9yJ3MgcGFyYW1zXG4gICAgICogQHJldHVybnMge0NvbHVtbnNFZGl0b3J9IHRoZSBDb2x1bW5zRWRpdG9yIG9iamVjdFxuICAgICAqL1xuICAgIHRyYW5zZm9ybVZhbHVlczogZnVuY3Rpb24gKGV2ZW50LCBwYXJhbXMpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlcyA9IHBhcmFtcy5lZGl0b3IudHJhbnNmb3JtVmFsdWVzKHRoaXMudGFibGVBUEkuZGF0YSgpLnRvQXJyYXkoKSk7XG4gICAgICAgIHRoaXMudGFibGVBUEkuY2xlYXIoKS5yb3dzLmFkZChuZXdWYWx1ZXMpO1xuICAgICAgICB0aGlzLmRyYXdUYWJsZSgpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0pO1xuXG4kKGRvY3VtZW50KS5vbigncHJlSW5pdC5kdCcsIGZ1bmN0aW9uIChlLCBzZXR0aW5ncykge1xuICAgIG5ldyBDb2x1bW5zRWRpdG9yKHNldHRpbmdzKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbHVtbnNFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIGVkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbi8qKlxuICogQW4gZWRpdG9yIHdoaWNoIHRvZ2dsZXMgaXRzIGZpZWxkXG4gKiBAdHlwZSB7e0VkaXRvcn19XG4gKi9cbnZhciBFZGl0b3IgPSB7XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgZWRpdG9yIGJ5IGluc2VydGluZyBpbnRvIHRoZSA8Yj4kaGVhZGVyPC9iPiB0aGUgY29tcG9uZW50XG4gICAgICogQ3JlYXRlcyB0aGUgZWRpdG9yIGJ1dHRvbiBhbmQgY2FsbCB0aGUgcmVhbCBlZGl0b3IncyBpbXBsZW1lbnRhdGlvblxuICAgICAqIGluIG9yZGVyIHRvIGFkZCBpdCBpbnRvIHRoZSBET01cbiAgICAgKlxuICAgICAqIEBzZWUgY3JlYXRlXG4gICAgICogQHBhcmFtIHskfSAkaGVhZGVyIHRoZSBoZWFkZXIncyBjb2x1bW4gd2hlcmUgdG8gYWRkIHRoZSBlZGl0b3JcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbiAoJGhlYWRlcikge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuJGRvbSA9ICRoZWFkZXI7XG5cbiAgICAgICAgLy8gV3JhcCB0aGUgY29sdW1uJ3MgaGVhZGVyIGludG8gYSBzcGFuXG4gICAgICAgIHZhciBsYWJlbCA9IHRoaXMuJGRvbS50ZXh0KCk7XG4gICAgICAgIHRoaXMuJGhlYWRlckxhYmVsID0gJCgnPHNwYW4vPicsIHtcbiAgICAgICAgICAgIGNsYXNzOiAnY29sdW1ucy1oZWFkZXItbGFiZWwnLFxuICAgICAgICAgICAgdGV4dDogbGFiZWxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSB0b2dnbGUgYnV0dG9uc1xuICAgICAgICB0aGlzLiRvcGVuQnV0dG9uID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgICAgICAgJ2NsYXNzJzogJ2NvbHVtbnMtZWRpdC1idXR0b24nXG4gICAgICAgIH0pLmFwcGVuZCgkKCc8aW1nLz4nLCAkLmV4dGVuZCh7XG4gICAgICAgICAgICBzcmM6ICcuLi9pbWcvZWRpdC5wbmcnXG4gICAgICAgIH0sIHRoaXMub3BlbkJ1dHRvbkF0dHJzKSkpO1xuXG4gICAgICAgIHRoaXMuJGNsb3NlQnV0dG9uID0gJCgnPGJ1dHRvbi8+Jywge1xuICAgICAgICAgICAgJ2NsYXNzJzogJ2NvbHVtbnMtZWRpdC1idXR0b24nXG4gICAgICAgIH0pLmFwcGVuZCgkKCc8aW1nLz4nLCB7XG4gICAgICAgICAgICBzcmM6ICcuLi9pbWcvYmFjay5wbmcnXG4gICAgICAgIH0pKS5oaWRlKCk7XG5cblxuICAgICAgICAvLyBDcmVhdGUgdGhlIGZpZWxkLFxuICAgICAgICAvLyBhbmQgd3JhcCBpdCBpbnRvIGEgc3BhblxuICAgICAgICB0aGlzLiRmaWVsZENvbnRhaW5lciA9ICQoJzxzcGFuLz4nLCB7XG4gICAgICAgICAgICAnY2xhc3MnOiAnY29sdW1ucy1lZGl0b3InXG4gICAgICAgIH0pXG4gICAgICAgICAgICAuYXBwZW5kKHRoaXMuY3JlYXRlKCkpXG4gICAgICAgICAgICAuaGlkZSgpO1xuXG4gICAgICAgIHRoaXMuJGRvbVxuICAgICAgICAgICAgLmVtcHR5KClcbiAgICAgICAgICAgIC5hcHBlbmQodGhpcy4kaGVhZGVyTGFiZWwpXG4gICAgICAgICAgICAuYXBwZW5kKHRoaXMuJGZpZWxkQ29udGFpbmVyKVxuICAgICAgICAgICAgLmFwcGVuZCh0aGlzLiRvcGVuQnV0dG9uKVxuICAgICAgICAgICAgLmFwcGVuZCh0aGlzLiRjbG9zZUJ1dHRvbiksXG5cbiAgICAgICAgdGhpcy4kb3BlbkJ1dHRvbi5jbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHNlbGYub3BlbigpO1xuICAgICAgICAgICAgc2VsZi5ub3RpZnlPcGVuKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuJGNsb3NlQnV0dG9uLmNsaWNrKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgc2VsZi5jbG9zZSgpO1xuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogc2hvd3MgdGhlIHJlYWwgZWRpdG9yIGltcGxlbWVudGF0aW9uXG4gICAgICovXG4gICAgb3BlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLiRvcGVuQnV0dG9uLmhpZGUoKTtcbiAgICAgICAgdGhpcy4kaGVhZGVyTGFiZWwuaGlkZSgpO1xuXG4gICAgICAgIHRoaXMuJGNsb3NlQnV0dG9uLnNob3coKTtcbiAgICAgICAgdGhpcy4kZmllbGRDb250YWluZXIuc2hvdygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBoaWRlcyB0aGUgcmVhbCBlZGl0b3IgaW1wbGVtZW50YXRpb25cbiAgICAgKi9cbiAgICBjbG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLiRjbG9zZUJ1dHRvbi5oaWRlKCk7XG4gICAgICAgIHRoaXMuJGZpZWxkQ29udGFpbmVyLmhpZGUoKTtcblxuICAgICAgICB0aGlzLiRoZWFkZXJMYWJlbC5zaG93KCk7XG4gICAgICAgIHRoaXMuJG9wZW5CdXR0b24uc2hvdygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBOb3RpZnkgdGhhdCB0aGUgZWRpdG9yIGlzIG9wZW5cbiAgICAgKi9cbiAgICBub3RpZnlPcGVuOiBmdW5jdGlvbiAoKSB7fSxcblxuICAgIC8qKlxuICAgICAqIE5vdGlmeSB0aGF0IHRoZSBlZGl0b3IgY2hhbmdlZFxuICAgICAqL1xuICAgIG5vdGlmeUNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm9uVmFsdWVDaGFuZ2VkKCk7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgdGhpcy4kZG9tLnRyaWdnZXIoJ3VwZGF0ZS5lZGl0b3JzLmR0Jywge1xuICAgICAgICAgICAgZWRpdG9yOiB0aGlzXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VyIGNhbGxlZCBhcyBzb29uIGFzIHRoZSB2YWx1ZXMgaGFzIGJlZW4gdHJhbnNmb3JtZWQgYnkgdGhlIGVkaXRvcnNcbiAgICAgKiBAc2VlIHRyYW5zZm9ybVZhbHVlc1xuICAgICAqL1xuICAgIG9uVmFsdWVDaGFuZ2VkOiBmdW5jdGlvbiAoKSB7fSxcblxuXG4gICAgLyoqXG4gICAgICogcmVnaXN0ZXIgYSBjYWxsYmFjayBjYWxsZWQgZWFjaCB0aW1lIHRoZSBlZGl0b3IncyB2YWx1ZSBjaGFuZ2VzXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIHRvIGNhbGwgb24gZWFjaCBlZGl0b3IncyBjaGFuZ2VcbiAgICAgKi9cbiAgICByZWdpc3RlcjogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuJGRvbS5vbigndXBkYXRlLmVkaXRvcnMuZHQnLCBjYWxsYmFjayk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3I7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBFZGl0b3IgPSByZXF1aXJlKCcuLy4uL2VkaXRvci9lZGl0b3InKTtcbnZhciBDb2x1bW5zRWRpdG9yID0gcmVxdWlyZSgnLi4vY29sdW1uc0VkaXRvcicpO1xuXG4vKipcbiAqIEFuIGVkaXRvciB3aGljaCByZW5kZXIgYSBidXR0b24uXG4gKiBEb2VzIG5vdGhpbmcgYnkgZGVmYXVsdDogeW91IG11c3QgaW1wbGVtZW50cyA8Yj50cmFuc2Zvcm1WYWx1ZXM8L2I+XG4gKiBpbiBvcmRlciB0byBwZXJmb3JtIHRoZSBjaGFuZ2VzIGVhY2ggdGltZSB0aGUgYnV0dG9uIGlzIGNsaWNrZWRcbiAqL1xudmFyIEJ1dHRvbkZpZWxkID0ge1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgYnV0dG9uXG4gICAgICogQHJldHVybnMge0J1dHRvbkZpZWxkfSBFZGl0b3JcbiAgICAgKi9cbiAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy4kYnV0dG9uID0gJCgnPGJ1dHRvbi8+JywgJC5leHRlbmQoe1xuICAgICAgICAgICAgJ2NsYXNzJzogJ2J0biBidG4tZGVmYXVsdCBjb2x1bW5zLWVkaXRvci1idXR0b24nLFxuICAgICAgICAgICAgJ3RleHQnOiAnY2xpY2stbWUnXG4gICAgICAgIH0sIHRoaXMuYnV0dG9uQXR0cnMpKTtcblxuICAgICAgICByZXR1cm4gdGhpcy4kYnV0dG9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMaXN0ZW4gZm9yIGJ1dHRvbidzIGNsaWNrIGV2ZW50XG4gICAgICovXG4gICAgbm90aWZ5T3BlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcuY29sdW1ucy1lZGl0b3ItYnV0dG9uJywgdGhpcy4kZG9tKVxuICAgICAgICAgICAgLm9uZSgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMub25DbGljaygpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVHJpZ2dlcmVkIGVhY2ggdGltZSB0aGUgYnV0dG9uIGlzIGNsaWNrZWRcbiAgICAgKi9cbiAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubm90aWZ5Q2hhbmdlKCk7XG4gICAgfVxufTtcblxuQ29sdW1uc0VkaXRvci5wcm90b3R5cGUuZmllbGRzLmJ1dHRvbiA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG4gICAgcmV0dXJuICQuZXh0ZW5kKHt9LCBFZGl0b3IsIEJ1dHRvbkZpZWxkLCBzZXR0aW5ncyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvbkZpZWxkO1xuIiwidmFyIEZpZWxkID0ge1xuXG4gICAgLyoqXG4gICAgICogU2V0IGVhY2ggY2VsbCB0byB0aGUgaW5wdXQncyB2YWx1ZS5cbiAgICAgKiBPbmx5IGNoYW5nZXMgYSBjZWxsJ3MgdmFsdWUgaWYgPGI+Y2FuQ2hhbmdlVmFsdWU8L2I+IHJldHVybnMgdHJ1ZSBmb3IgdGhlIHByb3ZpZGVkIGNlbGxcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBkYXRhUm93cyB0aGUgZW50aXJlIERhdGFUYWJsZSdzIGRhdGFzZXRcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IHRoZSBzYW1lIGRhdGFSb3dzLCBidXQgd2l0aCB2YWx1ZXMgY2hhbmdlZFxuICAgICAqL1xuICAgIHRyYW5zZm9ybVZhbHVlczogZnVuY3Rpb24gKGRhdGFSb3dzKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuICAgICAgICByZXR1cm4gZGF0YVJvd3MubWFwKGZ1bmN0aW9uIChyb3csIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jYW5DaGFuZ2VWYWx1ZShyb3dbdGhpcy5wcm9wZXJ0eV0sIGluZGV4LCByb3cpKSB7XG4gICAgICAgICAgICAgICAgcm93W3RoaXMucHJvcGVydHldID0gbmV3VmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByb3c7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNwZWNpZnkgaWYgYSBjZWxsIGlzIGVkaXRhYmxlXG4gICAgICogSW4gdGhpcyBpbXBsZW1lbnRhdGlvbiwgYWx3YXlzIHJldHVybnMgdHJ1ZS5cbiAgICAgKiBDYW4gYmUgb3ZlcnJpZGUgaW4gb3JkZXIgdG8gY2hvb3NlIHdoaWNoIGNlbGxzIGNhbiBiZSBjaGFuZ2VkXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBhbHdheXMgdHJ1ZVxuICAgICAqL1xuICAgIGNhbkNoYW5nZVZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmllbGQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIEZpZWxkID0gcmVxdWlyZSgnLi9maWVsZCcpO1xudmFyIEVkaXRvciA9IHJlcXVpcmUoJy4uL2VkaXRvci9lZGl0b3InKTtcbnZhciBDb2x1bW5zRWRpdG9yID0gcmVxdWlyZSgnLi4vY29sdW1uc0VkaXRvcicpO1xuXG4vKipcbiAqIEFuIGVkaXRvciB3aGljaCByZW5kZXIgYW4gaW5wdXQgdGV4dCxcbiAqIGFuZCBzZXQgYWxsIGNvbHVtbidzIGNlbGxzIHRvIHRoZSBpbnB1dCdzIHZhbHVlIHdoZW4gdXNlciB2YWxpZGF0ZXNcbiAqL1xudmFyIElucHV0RmllbGQgPSB7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRoZSBpbnB1dCBhbmQgaXRzIHZhbGlkYXRpb24gYnV0dG9uXG4gICAgICogQHJldHVybnMge0lucHV0RmllbGR9IElucHV0RmllbGRcbiAgICAgKi9cbiAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyID0gJCgnPHNwYW4vPicpO1xuICAgICAgICB0aGlzLiRpbnB1dCA9ICQoJzxpbnB1dC8+JywgJC5leHRlbmQoe1xuICAgICAgICAgICAgJ2NsYXNzJzogJ2NvbHVtbnMtaW5wdXQtaW5wdXQnXG4gICAgICAgIH0sIHRoaXMuaW5wdXRBdHRycykpO1xuXG4gICAgICAgIHRoaXMuJGVkaXRvckJ1dHRvbiA9ICQoJzxidXR0b24vPicsICQuZXh0ZW5kKHtcbiAgICAgICAgICAgICdjbGFzcyc6ICdjb2x1bW5zLWlucHV0LWJ1dHRvbicsXG4gICAgICAgICAgICAndGV4dCc6ICdPSydcbiAgICAgICAgfSwgdGhpcy52YWxpZGF0ZUJ1dHRvbkF0dHJzKSk7XG5cbiAgICAgICAgdGhpcy4kY29udGFpbmVyXG4gICAgICAgICAgICAuYXBwZW5kKHRoaXMuJGlucHV0KVxuICAgICAgICAgICAgLmFwcGVuZCh0aGlzLiRlZGl0b3JCdXR0b24pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLiRjb250YWluZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGxpc3RlbiBmb3IgaW5wdXQgY2hhbmdlc1xuICAgICAqL1xuICAgIG5vdGlmeU9wZW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy4kaW5wdXRcbiAgICAgICAgICAgIC8vIFByZXZlbnQgZnJvbSBzb3J0aW5nIGNvbHVtbiB3aGVuIHVzZXIgY2xpY2tzIG9uIGlucHV0XG4gICAgICAgICAgICAuY2xpY2soZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAua2V5cHJlc3MoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdFc2NhcGUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLmZvY3VzKCk7XG5cbiAgICAgICAgJCgnLmNvbHVtbnMtZWRpdG9yLWlucHV0YnV0dG9uJywgdGhpcy4kZG9tKVxuICAgICAgICAgICAgLm9uZSgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5Q2hhbmdlKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBmaWVsZCdzIHZhbHVlXG4gICAgICovXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGlucHV0LnZhbCgpO1xuICAgIH1cbn07XG5cbkNvbHVtbnNFZGl0b3IucHJvdG90eXBlLmZpZWxkcy5pbnB1dCA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XG4gICAgcmV0dXJuICQuZXh0ZW5kKHt9LCBFZGl0b3IsIEZpZWxkLCBJbnB1dEZpZWxkLCBzZXR0aW5ncyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IElucHV0RmllbGQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vZWRpdG9yL2VkaXRvcicpO1xucmVxdWlyZSgnLi9maWVsZC9pbnB1dCcpO1xucmVxdWlyZSgnLi9maWVsZC9idXR0b24nKTtcbnJlcXVpcmUoJy4vY29sdW1uc0VkaXRvcicpO1xuIl19
