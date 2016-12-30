$(document).ready(function () {
        var table = $('#exampleTable').DataTable({
            ajax: {
                url: "./data.json"
            },
            sAjaxDataProp: '',
            columns: [
                {
                    data: 'email'
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
                            text: 'test',
                            type: 'number'
                        }
                    },
                    render: function (value, type, row, meta) {
                        if(meta.row % 2 === 0) {
                            return $('<input/>', {
                                value: value
                            })[0].outerHTML;
                        }
                        return value;
                    }
                }
            ]
        });

        $('#reloadAjax').click(function () {
            table.ajax.url('./data2.json').ajax.reload();
        });
    }
);
