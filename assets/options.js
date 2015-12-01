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
        "show_reposts":     false
        ,"show_groups":     false
        ,"show_friends":    true
        ,"debug_mode":      false
    };
}

function options_text() {
    return {
        "hide_re":          ''
    };
}

function save_options() {
    if(!is_storage_ok()) return;
 
    var opts    = {};
    for(var key in options_bool()) {
        opts[key]   = document.getElementById(key).checked;
    }
    for(var key in options_text()) {
        opts[key]   = document.getElementById(key).value;
    }
    chrome.storage.sync.set(
        opts
        ,function() {
            // update status to let user know options were saved.
            var status = document.getElementById('status');
            status.textContent = 'Настройки сохранены';
            setTimeout(function() {
                status.textContent = '';
            }, 750);
        }
    );
}

function restore_options() {
    if(!is_storage_ok()) return;

    chrome.storage.sync.get(
        options_bool()
        ,function(items) {
            var opts    = {};
            for(var key in options_bool()) {
                document.getElementById(key).checked    = items[key];
            }
        }
    );

    chrome.storage.sync.get(
        options_text()
        ,function(items) {
            var opts    = {};
            for(var key in options_text()) {
                document.getElementById(key).value    = items[key];
            }
        }
    );
}

document.addEventListener('DOMContentLoaded', restore_options);
for(var key in options_bool()) {
    document.getElementById(key).addEventListener('change', save_options);
}
for(var key in options_text()) {
    document.getElementById(key).addEventListener('change', save_options);
    document.getElementById(key).addEventListener('keydown', save_options);
}
