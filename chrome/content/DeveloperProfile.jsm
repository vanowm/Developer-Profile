var EXPORTED_SYMBOLS = ['DeveloperProfile'];

/**
* The main DeveloperProfile object for the addon's shared code within the applications
*/
var DeveloperProfile = {
    /**
    * Handle preferences through this API at all times - it'll guarantee a clean uninstall.
    */
    preferences: {
        /**
        * Any addon preferences should be set through this.
        */
        addon: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch('extensions.DeveloperProfile.'),
        
        /**
        * The nsIPrefService branch calls should be made to this variable.
        */
        service: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService),
        
        /**
        * Set a preference and store its old value if we change it.
        */
        set: function(prefix, preference, newValue, cb) {
            // Declare this to be a local variable.
            var oldValue;
            
            // Get the preference's branch
            var branch = DeveloperProfile.preferences.service.getBranch(prefix+'.');
            
            // Depending on the expected type of this preference, get the old value.
            switch (typeof(newValue)) {
                case 'boolean': oldValue = branch.getBoolPref(preference); break;
                default: throw 'Unsupported type ('+typeof(newValue)+') of the preference value';
            }
            
            // If we do not have the same value on the assignment - remember the old one and set the new!
            if (oldValue != newValue)
                switch (typeof(newValue)) {
                    case 'boolean':
                        DeveloperProfile.preferences.addon.setBoolPref('defaults.booleans.'+prefix+'.'+preference, oldValue);
                        branch.setBoolPref(preference, newValue);
                    break;
                }
            
            // Return indifference statement
            return oldValue != newValue;
        }
    },
    
    /**
    * Use this API to create or undo the development profile
    */
    profiler: {
        /**
        * Set up the development environment
        */
        make: function() {
            DeveloperProfile.preferences.set('javascript.options', 'showInConsole', true);
            DeveloperProfile.preferences.set('nglayout.debug', 'disable_xul_cache', true);
            DeveloperProfile.preferences.set('browser.dom.window.dump', 'enabled', true);
            DeveloperProfile.preferences.set('javascript.options', 'strict', true);
            DeveloperProfile.preferences.set('devtools.chrome', 'enabled', true);
            DeveloperProfile.preferences.set('extensions.logging', 'enabled', true);
            DeveloperProfile.preferences.set('nglayout.debug', 'disable_xul_fastload', true);
            DeveloperProfile.preferences.set('dom', 'report_all_js_exceptions', true);
            DeveloperProfile.preferences.set('devtools.errorconsole', 'enabled', true);
        },
        
        /**
        * Revert back to the pre-installation state
        */
        undo: function() {
            DeveloperProfile.preferences.addon.getChildList('defaults.',{}).forEach(function(name) {
                // We need to split the entire preference name a bit to understand it
                var parts = name.split('.');
                
                // First off - we need to be in the default subspace.
                if (parts.shift() != 'defaults')
                    return;
                
                // Now, get the type of the preference!
                var type = parts.shift();
                
                // Get the name of the preference...
                var preference = parts.pop();
                
                // .. and get its branch
                var branch = DeveloperProfile.preferences.service.getBranch(parts.join('.')+'.');
                
                // Depending on the type, restore the variable.
                switch (type) {
                    case 'booleans':
                        branch.setBoolPref(preference,DeveloperProfile.preferences.addon.getBoolPref(name));
                    break;
                }
            });
        }
    }
};