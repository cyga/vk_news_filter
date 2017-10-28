(function (document) {
    "use strict";

    // UI
    for(var key in options_bool()) {
        jQuery('#'+key).change(save_options);
    }
    function init_number(sel) {
        jQuery(sel).change(save_options);
        jQuery(sel).keyup(save_options);
    }
    for(var key in options_number()) {
        init_number('#'+key);
    }
    function init_text(sel) {
        jQuery(sel).change(save_options);
        jQuery(sel).keyup(save_options);
    }
    for(var key in options_text()) {
        init_text('#'+key);
    }
    for(var key in options_select()) {
        jQuery('#'+key).change(save_options);
    }

    function init_hide_re_remove() {
        jQuery('.filter_re.glyphicon-remove').click(function() {
            jQuery(this).parents('div').first().remove();
            save_options();
        });
    }
    init_hide_re_remove();

    function hide_re_add(val) {
        if(undefined === val || null === val)
            val = '';
        jQuery('<div> <span class="filter_re glyphicon glyphicon-remove" aria-hidden="true"></span><input class="hide_re" type="text" value="'+val+'" placeholder="текст для фильтра"></div>')
            .insertBefore( jQuery('#hide_re_add_div') );
        init_hide_re_remove();
        init_text('.hide_re');
    }
    jQuery('#hide_re_add_div').click(function() {
        hide_re_add();
    });
    jQuery('#hide_re_label').click(function() {
        hide_re_add();
    });

    //make filters checkboxes disabled on click on #filter_switch checkbox
    function switch_ui() {
        var el_switch = jQuery('#filter_switch');
        var checkbox = jQuery('#form_options').find('input');
        var label = jQuery('#form_options').find('label');
        var select = jQuery('#likes_filter_op');
        var input = jQuery('input');
        var glyphicon = jQuery('.glyphicon');

        // console.log(label);
        var elements = [label, select, input, glyphicon];

        // console.log(elements);

        if(el_switch.is(':checked')) {
            checkbox.prop('disabled', false);
            select.prop('disabled', false);

            $.each(elements, function(key, value) {
                value.removeClass('disabled');
            });

        } else {
            checkbox.prop('disabled', true);
            select.prop('disabled', true);

            $.each(elements, function(key, value) {
                value.addClass('disabled');
            });

        }
    }
    jQuery('#filter_switch').on('click', function() {
        switch_ui();
    });

    // save/restore
    var opts    = {};

    function is_storage_ok() {
        if(!chrome.storage) {
            console.log("no storage permission was given, can't save options");
            alert("Нет разрешения на хранилище (передобавьте расширение с ним для возможности настройки)");
            return false;
        }
        return true;
    }

    function options_bool() {
        return {
             "filter_switch":   false
            ,"show_reposts":    false
            ,"show_groups":     false
            ,"show_ig":         true
            ,"show_friends":    true
            ,"show_adv":        false
            ,"show_adv_left":   false
            ,"likes_filter":    false
            ,"debug_mode":      false
        };
    }
    function options_text() {
        return {
            "search_text":   ''
        };
    }
    function options_number() {
        return {
            "min_likes":     0
        };
    }
    function options_select() {
        return {
             "likes_filter_op": 'ge'
        };
    }
    function options_text_groups() {
        return {
            "hide_re":          []
        };
    }
    var options_text_groups_add = {
        "hide_re":      hide_re_add
    };

    function save_options() {
        if(!is_storage_ok()) return;

        var changed = false;
        for(var key in options_bool()) {
            if(opts[key] != jQuery('#'+key).prop('checked')) {
                opts[key]   = jQuery('#'+key).prop('checked');
                changed     = true;
            }
        }

        for(var key in options_number()) {
            if(opts[key] != jQuery('#'+key).val()) {
                opts[key]   = parseInt(jQuery('#'+key).val());
                if(isNaN(opts[key])) {
                    opts[key] = 0;
                }
                changed     = true;
            }
        }

        for(var key in options_text()) {
            if(opts[key] != jQuery('#'+key).val()) {
                opts[key]   = jQuery('#'+key).val();
                changed     = true;
            }
        }

        for(var key in options_select()) {
            if(opts[key] != jQuery('#'+key).val()) {
                opts[key]   = jQuery('#'+key).val();
                changed     = true;
            }
        }

        for(var key in options_text_groups()) {
            var vals    = [];
            jQuery('.'+key).each(function(idx, el){
                vals.push(jQuery(el).val());
            });

            if(!jQuery.isArray(opts[key])) {
                changed = true;
            }
            else if(opts[key].length != vals.length) {
                changed = true;
            }
            else {
                for(var i=0; i<vals.length; i++) {
                    if(opts[key][i] != vals[i]) {
                        changed         = true;
                    }
                }
            }

            opts[key]   = vals;
        }

        if(changed) {
            chrome.storage.sync.set(
                opts
                ,function() {
                    // update status to let user know options were saved
                    var status_el = jQuery('#status');
                    status_el.text('Настройки сохранены');
                    setTimeout(function() {
                        status_el.text('');
                    }, 750);
                }
            );
        }
    }

    // number of calls to chrome.storage.sync.get
    var n_options2restore = 0;
    function restore_option() {
        n_options2restore--;
        if(0 == n_options2restore) {
            // code to run on all options restored event
            // because code after restore_options()
            // doesn't work properly without such async call
            switch_ui();
        }
    }

    function restore_options() {
        if(!is_storage_ok()) return;

        n_options2restore++;
        chrome.storage.sync.get(
            options_bool()
            ,function(items) {
                for(var key in options_bool()) {
                    jQuery('#'+key).prop('checked', opts[key] = items[key]);
                }
                restore_option();
            }
        );

        n_options2restore++;
        chrome.storage.sync.get(
            options_text()
            ,function(items) {
                for(var key in options_text()) {
                    jQuery('#'+key).val( opts[key] = items[key] );
                }
                restore_option();
            }
        );

        n_options2restore++;
        chrome.storage.sync.get(
            options_number()
            ,function(items) {
                for(var key in options_number()) {
                    jQuery('#'+key).val( opts[key] = items[key] );
                }
                restore_option();
            }
        );

        n_options2restore++;
        chrome.storage.sync.get(
            options_select()
            ,function(items) {
                for(var key in options_select()) {
                    jQuery('#'+key).val( opts[key] = items[key] );
                }
                restore_option();
            }
        );

        n_options2restore++;
        chrome.storage.sync.get(
            options_text_groups()
            ,function(items) {
                for(var key in options_text_groups()) {
                    var tmp = items[key];
                    if(jQuery.isArray(tmp)) {
                        opts[key]   = tmp;
                    }
                    else if(
                        undefined !== tmp
                        &&
                        null !== tmp
                        &&
                        '' !== tmp
                    ) {
                        opts[key]   = [tmp];
                    }
                    else {
                        opts[key]   = [];
                    }

                    for(var i=0; i<opts[key].length; i++) {
                        options_text_groups_add[key]( opts[key][i] );
                    }
                }
                restore_option();
            }
        );
    }

    restore_options();

    jQuery("#search_clear").click(function(){
        // only user's actions trigger change => force it
        jQuery("#search_text").val('').trigger('change');
    });
}(document));
