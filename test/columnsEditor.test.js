var expect = chai.expect;

describe("Initialize HTML", function () {
    it("should contains table", function () {
        var table = $("#exampleTable");
        expect(table.length).to.equal(1);
    });

    it("should initialize DataTable", function () {
        var wrapper = $("#exampleTable_wrapper");
        expect(wrapper.length).to.equal(1);
    });
});

describe("First column", function () {
    it("should have an editor", function () {
        var $firstColumn = $('table th:eq(0)');
        var $label = $firstColumn.find('.columns-header-label');
        var $openButton = $firstColumn.find('.columns-edit-open');
        var $closeButton = $firstColumn.find('.columns-edit-close');
        var $editorButton = $firstColumn.find('.columns-editor button');

        expect($openButton.length).to.equal(1);
        expect($label.length).to.equal(1);
        expect($closeButton.length).to.equal(1);
        expect($editorButton.length).to.equal(1);

        expect($label.is(':visible')).to.be.true;
        expect($openButton.is(':visible')).to.be.true;
        expect($closeButton.is(':visible')).to.be.false;
        expect($editorButton.is(':visible')).to.be.false;


    });

    it("that should be opened", function () {
        var $firstColumn = $('table th:eq(0)');
        var $label = $firstColumn.find('.columns-header-label');
        var $openButton = $firstColumn.find('.columns-edit-open');
        var $closeButton = $firstColumn.find('.columns-edit-close');
        var $editorButton = $firstColumn.find('.columns-editor button');

        $openButton.click();

        expect($label.is(':visible')).to.be.false;
        expect($openButton.is(':visible')).to.be.false;
        expect($closeButton.is(':visible')).to.be.true;
        expect($editorButton.is(':visible')).to.be.true;
    });

    it("then the editor should run its callback on click", function () {
        var firstColumnHeader = $('table th:eq(0)');
        var $label = firstColumnHeader.find('.columns-header-label');
        var $openButton = firstColumnHeader.find('.columns-edit-open');
        var $closeButton = firstColumnHeader.find('.columns-edit-close');
        var $editorButton = firstColumnHeader.find('.columns-editor button');

        var firstColumnValue = $('table tr td:eq(0)').text();
        expect($label.is(':visible')).to.be.false;
        expect($openButton.is(':visible')).to.be.false;
        expect($closeButton.is(':visible')).to.be.true;
        expect($editorButton.is(':visible')).to.be.true;

        $editorButton.click();

        expect($label.is(':visible')).to.be.true;
        expect($openButton.is(':visible')).to.be.true;
        expect($closeButton.is(':visible')).to.be.false;
        expect($editorButton.is(':visible')).to.be.false;
        expect(firstColumnValue).to.be.not.equal('caseypaul@gink.com');
    });
});