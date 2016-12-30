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

                    }
                }
            ]
        });

        $('#reloadAjax').click(function () {
            table.ajax.url('./data2.json').ajax.reload();
        });
    }
);
