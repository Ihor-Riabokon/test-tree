$(document).ready(function () {
    var url = '/api/companies';
    var tree = $('#tree');

    tree.jstree({
        core: {
            expand_selected_onload : true,
            data: {
                url: url
            }
        }
    }).on('ready.jstree', function(){ $(this).jstree('open_all') });

    $('#add').click(function () {
        var title = prompt('Enter company name:');
        var rate = prompt('Enter company rate:');
        var id = tree.jstree('get_selected')[0];

        if (title && title.length && rate && rate.length && !isNaN(+rate)) {
            var data = {
                title: title,
                rate: rate
            };

            if (id && id !== 'root') {
                data.parent = id;
            }

            $.ajax({
                url: url,
                method: 'POST',
                data: data,
                success: function (data) {
                    tree.jstree('refresh');
                }
            })
        }else{
            return alert('Validation error!');
        }
    });

    $('#edit').click(function () {
        var title = prompt('Enter new company name:');
        var rate = prompt('Enter new company rate:');

        if (title && title.length && rate && rate.length && !isNaN(+rate)) {
            var id = tree.jstree('get_selected')[0];
            var data = {
                id: id,
                title: title,
                rate: rate
            };

            $.ajax({
                url: url + '/' + id,
                type: 'PUT',
                data: data,
                success: function (data) {
                    console.log(data);
                    tree.jstree('refresh');
                }
            })
        }else{
            return alert('Validation error!');
        }
    });

    $('#delete').click(function () {
        var id = tree.jstree('get_selected')[0];
        if (id === 'root') return alert('You cannot delete root category');

        if (confirm('Are you sure you what to delete this company?')) {
            $.ajax({
                url: url + '/' + id,
                type: 'delete',
                success: function () {
                    tree.jstree('refresh');
                }
            })
        }
    })
});