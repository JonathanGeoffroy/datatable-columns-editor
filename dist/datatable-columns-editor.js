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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2pnZW9mZnJvL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL2NvbHVtbnNFZGl0b3IuanMiLCJqcy9lZGl0b3IvZWRpdG9yLmpzIiwianMvZmllbGQvYnV0dG9uLmpzIiwianMvZmllbGQvZmllbGQuanMiLCJqcy9maWVsZC9pbnB1dC5qcyIsImpzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xyXG5cclxuLyoqXHJcbiAqIENvbHVtbnNFZGl0b3IgaXMgYSBjb21wb25lbnQgdGhhdCBtYW5hZ2VzIGEgbGlzdCBvZiBmaWx0ZXJzIGluZHNpZGVcclxuICogYSBkYXRhdGFibGUgaGVhZGVyIHJvdy5cclxuICpcclxuICogVGhpcyBjb25zdHJ1Y3RvciBiaW5kcyBsaXN0ZW5lcnMgdG8gdmFyaW91cyBkYXRhdGFibGUgZXZlbnRzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3Mgb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoZSBkYXRhdGFibGVcclxuICovXHJcbnZhciBDb2x1bW5zRWRpdG9yID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XHJcbiAgICB0aGlzLnRhYmxlQVBJID0gbmV3ICQuZm4uZGF0YVRhYmxlLkFwaShzZXR0aW5ncyk7XHJcbiAgICB0aGlzLiRoZWFkZXIgPSAkKHRoaXMudGFibGVBUEkudGFibGUoKS5oZWFkZXIoKSk7XHJcbiAgICB0aGlzLnNldHRpbmdzID0gc2V0dGluZ3M7XHJcblxyXG4gICAgdmFyIGVkaXRvcnMgPSBzZXR0aW5ncy5hb0NvbHVtbnMuZmlsdGVyKGZ1bmN0aW9uIChjb2x1bW4pIHtcclxuICAgICAgICByZXR1cm4gY29sdW1uLmVkaXRvcjtcclxuICAgIH0pXHJcbiAgICAubWFwKGZ1bmN0aW9uIChwYXJhbSkge1xyXG4gICAgICAgIHZhciBvcHRpb25zID0gJC5leHRlbmQoe1xyXG4gICAgICAgICAgICBjb2x1bW46IHBhcmFtLmlkeCxcclxuICAgICAgICAgICAgcHJvcGVydHk6IHBhcmFtLmRhdGFcclxuICAgICAgICB9LCBwYXJhbS5lZGl0b3IpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5maWVsZHNbcGFyYW0uZWRpdG9yLnR5cGVdKG9wdGlvbnMpO1xyXG4gICAgfSwgdGhpcyk7XHJcblxyXG4gICAgaWYoZWRpdG9ycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5lZGl0b3JzID0gZWRpdG9ycztcclxuICAgICAgICB0aGlzLnRhYmxlQVBJLm9uKCdpbml0JywgdGhpcy5vbkRhdGFUYWJsZUluaXQuYmluZCh0aGlzKSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4kLmV4dGVuZChDb2x1bW5zRWRpdG9yLnByb3RvdHlwZSwge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXJyYXkgb2YgZmllbGQgY29uc3RydWN0b3IgZnVuY3Rpb24uIEVhY2ggZnVuY3Rpb25cclxuICAgICAqIHRha2VzIGEgc2V0dGluZyBvYmplY3QgYXMgaXRzIHNpbmdsZSBwYXJhbWV0ZXJcclxuICAgICAqL1xyXG4gICAgZmllbGRzOiB7fSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemUgYWxsIGVkaXRvcnMgYW5kIGFkZCB0aGVtIGludG8gZGF0YXRhYmxlIGhlYWRlclxyXG4gICAgICogSXQgYWxzbyByZWdpc3RlcnMgdGhlIG1haW4gZXZlbnQgaGFuZGxlciB0aGF0IHdpbGwgcmVhY3QgdG8gdGhlIGVkaXRvcidcclxuICAgICAqIHZhbHVlIGNoYW5nZXMuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIGV2ZW50IG5hbWUgaXMgPGI+dXBkYXRlLmVkaXRvcnMuZHQ8L2I+LiBUaGlzIGV2ZW50IG11c3QgYmUgdHJpZ2dlcmVkIGJ5IHRoZVxyXG4gICAgICogZWRpdG9ycyB3aGVuIHRoZWlyIHZhbHVlIGlzIG1vZGlmaWVkIGJ5IHRoZSB1c2VyIChvciBhbnkgb3RoZXIgZXZlbnQgdGhhdFxyXG4gICAgICogc2hvdWxkIHRyaWdnZXIgYSBkYXRhdGFibGUgZmlsdGVyKS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7Q29sdW1uc0VkaXRvcn0gdGhlIENvbHVtbnNFZGl0b3Igb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIHNldHVwSGVhZGVyUm93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lZGl0b3JzLmZvckVhY2goZnVuY3Rpb24gKGVkaXRvcikge1xyXG4gICAgICAgICAgICBlZGl0b3IuaW5pdCgkKHRoaXMudGFibGVBUEkuY29sdW1uKGVkaXRvci5jb2x1bW4pLmhlYWRlcigpKSk7XHJcbiAgICAgICAgICAgIGVkaXRvci5yZWdpc3RlcigkLnByb3h5KHRoaXMudHJhbnNmb3JtVmFsdWVzLCB0aGlzKSk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZHJhd3MgdGhlIGRhdGFUYWJsZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtDb2x1bW5zRWRpdG9yfSB0aGUgQ29sdW1uc0VkaXRvciBvYmplY3RcclxuICAgICAqL1xyXG4gICAgZHJhd1RhYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy50YWJsZUFQSS5kcmF3KCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFjdGlvbnMgdG8gZXhlY3V0ZSB3aGVuIHRoZSBkYXRhVGFibGUgaXMgZG9uZSBpbml0aWFsaXppbmcuXHJcbiAgICAgKiBDcmVhdGUgYW5kIGFkZCAgYWxsIGVkaXRvcnMgaW50byB0aGUgZGF0YVRhYmxlIGhlYWRlclxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtDb2x1bW5zRWRpdG9yfSB0aGUgQ29sdW1uc0VkaXRvciBvYmplY3RcclxuICAgICAqL1xyXG4gICAgb25EYXRhVGFibGVJbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR1cEhlYWRlclJvdygpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2Zvcm0gdmFsdWVzIG9mIHRoZSBlbnRpcmUgZGF0YVRhYmxlXHJcbiAgICAgKiBBc2sgdG8gdGhlIGVkaXRvciB0aGF0IGhhcyBjaGFuZ2VkIHRvIHRyYW5zZm9ybSBkYXRhLFxyXG4gICAgICogYW5kIHRoZW4gcmUtcmVuZGVyIHRoZSBkYXRhVGFibGVcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCB0cmlnZ2VyZWQgRXZlbnRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgZWRpdG9yJ3MgcGFyYW1zXHJcbiAgICAgKiBAcmV0dXJucyB7Q29sdW1uc0VkaXRvcn0gdGhlIENvbHVtbnNFZGl0b3Igb2JqZWN0XHJcbiAgICAgKi9cclxuICAgIHRyYW5zZm9ybVZhbHVlczogZnVuY3Rpb24gKGV2ZW50LCBwYXJhbXMpIHtcclxuICAgICAgICB2YXIgbmV3VmFsdWVzID0gcGFyYW1zLmVkaXRvci50cmFuc2Zvcm1WYWx1ZXModGhpcy50YWJsZUFQSS5kYXRhKCkudG9BcnJheSgpKTtcclxuICAgICAgICB0aGlzLnRhYmxlQVBJLmNsZWFyKCkucm93cy5hZGQobmV3VmFsdWVzKTtcclxuICAgICAgICB0aGlzLmRyYXdUYWJsZSgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG4kKGRvY3VtZW50KS5vbigncHJlSW5pdC5kdCcsIGZ1bmN0aW9uIChlLCBzZXR0aW5ncykge1xyXG4gICAgbmV3IENvbHVtbnNFZGl0b3Ioc2V0dGluZ3MpO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uc0VkaXRvcjtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XHJcblxyXG4vKipcclxuICogQW4gZWRpdG9yIHdoaWNoIHRvZ2dsZXMgaXRzIGZpZWxkXHJcbiAqIEB0eXBlIHt7RWRpdG9yfX1cclxuICovXHJcbnZhciBFZGl0b3IgPSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgZWRpdG9yIGJ5IGluc2VydGluZyBpbnRvIHRoZSA8Yj4kaGVhZGVyPC9iPiB0aGUgY29tcG9uZW50XHJcbiAgICAgKiBDcmVhdGVzIHRoZSBlZGl0b3IgYnV0dG9uIGFuZCBjYWxsIHRoZSByZWFsIGVkaXRvcidzIGltcGxlbWVudGF0aW9uXHJcbiAgICAgKiBpbiBvcmRlciB0byBhZGQgaXQgaW50byB0aGUgRE9NXHJcbiAgICAgKlxyXG4gICAgICogQHNlZSBjcmVhdGVcclxuICAgICAqIEBwYXJhbSB7JH0gJGhlYWRlciB0aGUgaGVhZGVyJ3MgY29sdW1uIHdoZXJlIHRvIGFkZCB0aGUgZWRpdG9yXHJcbiAgICAgKi9cclxuICAgIGluaXQ6IGZ1bmN0aW9uICgkaGVhZGVyKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuJGRvbSA9ICRoZWFkZXI7XHJcblxyXG4gICAgICAgIC8vIFdyYXAgdGhlIGNvbHVtbidzIGhlYWRlciBpbnRvIGEgc3BhblxyXG4gICAgICAgIHZhciBsYWJlbCA9IHRoaXMuJGRvbS50ZXh0KCk7XHJcbiAgICAgICAgdGhpcy4kaGVhZGVyTGFiZWwgPSAkKCc8c3Bhbi8+Jywge1xyXG4gICAgICAgICAgICBjbGFzczogJ2NvbHVtbnMtaGVhZGVyLWxhYmVsJyxcclxuICAgICAgICAgICAgdGV4dDogbGFiZWxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSB0b2dnbGUgYnV0dG9uc1xyXG4gICAgICAgIHRoaXMuJG9wZW5CdXR0b24gPSAkKCc8YnV0dG9uLz4nLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICdjb2x1bW5zLWVkaXQtYnV0dG9uIGNvbHVtbnMtZWRpdC1vcGVuJ1xyXG4gICAgICAgIH0pLmFwcGVuZCgkKCc8aW1nLz4nLCAkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIHNyYzogJy4uL2ltZy9lZGl0LnBuZydcclxuICAgICAgICB9LCB0aGlzLm9wZW5CdXR0b25BdHRycykpKTtcclxuXHJcbiAgICAgICAgdGhpcy4kY2xvc2VCdXR0b24gPSAkKCc8YnV0dG9uLz4nLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICdjb2x1bW5zLWVkaXQtYnV0dG9uIGNvbHVtbnMtZWRpdC1jbG9zZSdcclxuICAgICAgICB9KS5hcHBlbmQoJCgnPGltZy8+Jywge1xyXG4gICAgICAgICAgICBzcmM6ICcuLi9pbWcvYmFjay5wbmcnXHJcbiAgICAgICAgfSkpLmhpZGUoKTtcclxuXHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZmllbGQsXHJcbiAgICAgICAgLy8gYW5kIHdyYXAgaXQgaW50byBhIHNwYW5cclxuICAgICAgICB0aGlzLiRmaWVsZENvbnRhaW5lciA9ICQoJzxzcGFuLz4nLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICdjb2x1bW5zLWVkaXRvcidcclxuICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYXBwZW5kKHRoaXMuY3JlYXRlKCkpXHJcbiAgICAgICAgICAgIC5oaWRlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuJGRvbVxyXG4gICAgICAgICAgICAuZW1wdHkoKVxyXG4gICAgICAgICAgICAuYXBwZW5kKHRoaXMuJGhlYWRlckxhYmVsKVxyXG4gICAgICAgICAgICAuYXBwZW5kKHRoaXMuJGZpZWxkQ29udGFpbmVyKVxyXG4gICAgICAgICAgICAuYXBwZW5kKHRoaXMuJG9wZW5CdXR0b24pXHJcbiAgICAgICAgICAgIC5hcHBlbmQodGhpcy4kY2xvc2VCdXR0b24pLFxyXG5cclxuICAgICAgICB0aGlzLiRvcGVuQnV0dG9uLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgc2VsZi5vcGVuKCk7XHJcbiAgICAgICAgICAgIHNlbGYubm90aWZ5T3BlbigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLiRjbG9zZUJ1dHRvbi5jbGljayhmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHNlbGYuY2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzaG93cyB0aGUgcmVhbCBlZGl0b3IgaW1wbGVtZW50YXRpb25cclxuICAgICAqL1xyXG4gICAgb3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuJG9wZW5CdXR0b24uaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuJGhlYWRlckxhYmVsLmhpZGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy4kY2xvc2VCdXR0b24uc2hvdygpO1xyXG4gICAgICAgIHRoaXMuJGZpZWxkQ29udGFpbmVyLnNob3coKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBoaWRlcyB0aGUgcmVhbCBlZGl0b3IgaW1wbGVtZW50YXRpb25cclxuICAgICAqL1xyXG4gICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLiRjbG9zZUJ1dHRvbi5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy4kZmllbGRDb250YWluZXIuaGlkZSgpO1xyXG5cclxuICAgICAgICB0aGlzLiRoZWFkZXJMYWJlbC5zaG93KCk7XHJcbiAgICAgICAgdGhpcy4kb3BlbkJ1dHRvbi5zaG93KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm90aWZ5IHRoYXQgdGhlIGVkaXRvciBpcyBvcGVuXHJcbiAgICAgKi9cclxuICAgIG5vdGlmeU9wZW46IGZ1bmN0aW9uICgpIHt9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTm90aWZ5IHRoYXQgdGhlIGVkaXRvciBjaGFuZ2VkXHJcbiAgICAgKi9cclxuICAgIG5vdGlmeUNoYW5nZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMub25WYWx1ZUNoYW5nZWQoKTtcclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgdGhpcy4kZG9tLnRyaWdnZXIoJ3VwZGF0ZS5lZGl0b3JzLmR0Jywge1xyXG4gICAgICAgICAgICBlZGl0b3I6IHRoaXNcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmlnZ2VyIGNhbGxlZCBhcyBzb29uIGFzIHRoZSB2YWx1ZXMgaGFzIGJlZW4gdHJhbnNmb3JtZWQgYnkgdGhlIGVkaXRvcnNcclxuICAgICAqIEBzZWUgdHJhbnNmb3JtVmFsdWVzXHJcbiAgICAgKi9cclxuICAgIG9uVmFsdWVDaGFuZ2VkOiBmdW5jdGlvbiAoKSB7fSxcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZWdpc3RlciBhIGNhbGxiYWNrIGNhbGxlZCBlYWNoIHRpbWUgdGhlIGVkaXRvcidzIHZhbHVlIGNoYW5nZXNcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIHRoZSBjYWxsYmFjayB0byBjYWxsIG9uIGVhY2ggZWRpdG9yJ3MgY2hhbmdlXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICB0aGlzLiRkb20ub24oJ3VwZGF0ZS5lZGl0b3JzLmR0JywgY2FsbGJhY2spO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3I7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xyXG52YXIgRWRpdG9yID0gcmVxdWlyZSgnLi8uLi9lZGl0b3IvZWRpdG9yJyk7XHJcbnZhciBDb2x1bW5zRWRpdG9yID0gcmVxdWlyZSgnLi4vY29sdW1uc0VkaXRvcicpO1xyXG5cclxuLyoqXHJcbiAqIEFuIGVkaXRvciB3aGljaCByZW5kZXIgYSBidXR0b24uXHJcbiAqIERvZXMgbm90aGluZyBieSBkZWZhdWx0OiB5b3UgbXVzdCBpbXBsZW1lbnRzIDxiPnRyYW5zZm9ybVZhbHVlczwvYj5cclxuICogaW4gb3JkZXIgdG8gcGVyZm9ybSB0aGUgY2hhbmdlcyBlYWNoIHRpbWUgdGhlIGJ1dHRvbiBpcyBjbGlja2VkXHJcbiAqL1xyXG52YXIgQnV0dG9uRmllbGQgPSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIHRoZSBidXR0b25cclxuICAgICAqIEByZXR1cm5zIHtCdXR0b25GaWVsZH0gRWRpdG9yXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuJGJ1dHRvbiA9ICQoJzxidXR0b24vPicsICQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogJ2J0biBidG4tZGVmYXVsdCBjb2x1bW5zLWVkaXRvci1idXR0b24nLFxyXG4gICAgICAgICAgICAndGV4dCc6ICdjbGljay1tZSdcclxuICAgICAgICB9LCB0aGlzLmJ1dHRvbkF0dHJzKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLiRidXR0b247XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTGlzdGVuIGZvciBidXR0b24ncyBjbGljayBldmVudFxyXG4gICAgICovXHJcbiAgICBub3RpZnlPcGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmNvbHVtbnMtZWRpdG9yLWJ1dHRvbicsIHRoaXMuJGRvbSlcclxuICAgICAgICAgICAgLm9uZSgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub25DbGljaygpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyaWdnZXJlZCBlYWNoIHRpbWUgdGhlIGJ1dHRvbiBpcyBjbGlja2VkXHJcbiAgICAgKi9cclxuICAgIG9uQ2xpY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLm5vdGlmeUNoYW5nZSgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ29sdW1uc0VkaXRvci5wcm90b3R5cGUuZmllbGRzLmJ1dHRvbiA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgICByZXR1cm4gJC5leHRlbmQoe30sIEVkaXRvciwgQnV0dG9uRmllbGQsIHNldHRpbmdzKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uRmllbGQ7XHJcbiIsInZhciBGaWVsZCA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBlYWNoIGNlbGwgdG8gdGhlIGlucHV0J3MgdmFsdWUuXHJcbiAgICAgKiBPbmx5IGNoYW5nZXMgYSBjZWxsJ3MgdmFsdWUgaWYgPGI+Y2FuQ2hhbmdlVmFsdWU8L2I+IHJldHVybnMgdHJ1ZSBmb3IgdGhlIHByb3ZpZGVkIGNlbGxcclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGRhdGFSb3dzIHRoZSBlbnRpcmUgRGF0YVRhYmxlJ3MgZGF0YXNldFxyXG4gICAgICogQHJldHVybnMge0FycmF5fSB0aGUgc2FtZSBkYXRhUm93cywgYnV0IHdpdGggdmFsdWVzIGNoYW5nZWRcclxuICAgICAqL1xyXG4gICAgdHJhbnNmb3JtVmFsdWVzOiBmdW5jdGlvbiAoZGF0YVJvd3MpIHtcclxuICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkYXRhUm93cy5tYXAoZnVuY3Rpb24gKHJvdywgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY2FuQ2hhbmdlVmFsdWUocm93W3RoaXMucHJvcGVydHldLCBpbmRleCwgcm93KSkge1xyXG4gICAgICAgICAgICAgICAgcm93W3RoaXMucHJvcGVydHldID0gbmV3VmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByb3c7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTcGVjaWZ5IGlmIGEgY2VsbCBpcyBlZGl0YWJsZVxyXG4gICAgICogSW4gdGhpcyBpbXBsZW1lbnRhdGlvbiwgYWx3YXlzIHJldHVybnMgdHJ1ZS5cclxuICAgICAqIENhbiBiZSBvdmVycmlkZSBpbiBvcmRlciB0byBjaG9vc2Ugd2hpY2ggY2VsbHMgY2FuIGJlIGNoYW5nZWRcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBhbHdheXMgdHJ1ZVxyXG4gICAgICovXHJcbiAgICBjYW5DaGFuZ2VWYWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWVsZDtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XHJcbnZhciBGaWVsZCA9IHJlcXVpcmUoJy4vZmllbGQnKTtcclxudmFyIEVkaXRvciA9IHJlcXVpcmUoJy4uL2VkaXRvci9lZGl0b3InKTtcclxudmFyIENvbHVtbnNFZGl0b3IgPSByZXF1aXJlKCcuLi9jb2x1bW5zRWRpdG9yJyk7XHJcblxyXG4vKipcclxuICogQW4gZWRpdG9yIHdoaWNoIHJlbmRlciBhbiBpbnB1dCB0ZXh0LFxyXG4gKiBhbmQgc2V0IGFsbCBjb2x1bW4ncyBjZWxscyB0byB0aGUgaW5wdXQncyB2YWx1ZSB3aGVuIHVzZXIgdmFsaWRhdGVzXHJcbiAqL1xyXG52YXIgSW5wdXRGaWVsZCA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgdGhlIGlucHV0IGFuZCBpdHMgdmFsaWRhdGlvbiBidXR0b25cclxuICAgICAqIEByZXR1cm5zIHtJbnB1dEZpZWxkfSBJbnB1dEZpZWxkXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuJGNvbnRhaW5lciA9ICQoJzxzcGFuLz4nKTtcclxuICAgICAgICB0aGlzLiRpbnB1dCA9ICQoJzxpbnB1dC8+JywgJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAnY2xhc3MnOiAnY29sdW1ucy1pbnB1dC1pbnB1dCdcclxuICAgICAgICB9LCB0aGlzLmlucHV0QXR0cnMpKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZWRpdG9yQnV0dG9uID0gJCgnPGJ1dHRvbi8+JywgJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAnY2xhc3MnOiAnY29sdW1ucy1pbnB1dC1idXR0b24nLFxyXG4gICAgICAgICAgICAndGV4dCc6ICdPSydcclxuICAgICAgICB9LCB0aGlzLnZhbGlkYXRlQnV0dG9uQXR0cnMpKTtcclxuXHJcbiAgICAgICAgdGhpcy4kY29udGFpbmVyXHJcbiAgICAgICAgICAgIC5hcHBlbmQodGhpcy4kaW5wdXQpXHJcbiAgICAgICAgICAgIC5hcHBlbmQodGhpcy4kZWRpdG9yQnV0dG9uKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuJGNvbnRhaW5lcjtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBsaXN0ZW4gZm9yIGlucHV0IGNoYW5nZXNcclxuICAgICAqL1xyXG4gICAgbm90aWZ5T3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuJGlucHV0XHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgZnJvbSBzb3J0aW5nIGNvbHVtbiB3aGVuIHVzZXIgY2xpY2tzIG9uIGlucHV0XHJcbiAgICAgICAgICAgIC5jbGljayhmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5rZXlwcmVzcyhmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ0VzY2FwZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnRW50ZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSlcclxuICAgICAgICAgICAgLmZvY3VzKCk7XHJcblxyXG4gICAgICAgICQoJy5jb2x1bW5zLWVkaXRvci1pbnB1dGJ1dHRvbicsIHRoaXMuJGRvbSlcclxuICAgICAgICAgICAgLm9uZSgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBmaWVsZCdzIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGdldFZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuJGlucHV0LnZhbCgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuQ29sdW1uc0VkaXRvci5wcm90b3R5cGUuZmllbGRzLmlucHV0ID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICAgIHJldHVybiAkLmV4dGVuZCh7fSwgRWRpdG9yLCBGaWVsZCwgSW5wdXRGaWVsZCwgc2V0dGluZ3MpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbnB1dEZpZWxkO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5yZXF1aXJlKCcuL2VkaXRvci9lZGl0b3InKTtcclxucmVxdWlyZSgnLi9maWVsZC9pbnB1dCcpO1xyXG5yZXF1aXJlKCcuL2ZpZWxkL2J1dHRvbicpO1xyXG5yZXF1aXJlKCcuL2NvbHVtbnNFZGl0b3InKTtcclxuIl19
