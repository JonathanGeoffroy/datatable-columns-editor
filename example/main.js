$(document).ready(function () {
        var table = $('#exampleTable').DataTable({
            ajax: {
                url: "./data.json"
            },
            sAjaxDataProp: '',
            columns: [
                {
                    data: 'email',
                    editor: {
                        type: 'button',
                        transformValues: function (dataRows) {
                            return dataRows.map(function (row, index) {
                                row.email = row.email.split("").reverse().join("");
                                return row;
                            }.bind(this));
                        },
                        buttonAttrs: {
                            text: 'reverse emails'
                        }
                    }
                },
                {
                    data: 'name',
                    visible: false
                },
                {
                    data: 'gender'
                },
                {
                    data: 'company'
                },
                {
                    data: 'friends',
                    editor: {
                        type: 'input',
                        inputAttrs: {
                            type: 'number'
                        },
                        validateButtonAttrs: {
                            text: 'test'
                        }
                    }
                }
            ]
        });
    }
);
