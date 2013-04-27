Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/AddonManager.jsm");
const PREF_BRANCH = "extensions.DeveloperProfile.",
			PREF_DEFAULT_BRANCH = "defaults.booleans.";
var	options =	 [['javascript.options.showInConsole',true],
								['nglayout.debug.disable_xul_cache',true],
								['browser.dom.window.dump.enabled',true],
								['javascript.options.strict',true],
								['devtools.chrome.enabled',true],
								['extensions.logging.enabled',true],
								['nglayout.debug.disable_xul_fastload',true],
								['dom.report_all_js_exceptions',true],
								['devtools.errorconsole.enabled',true]];

function set(reason)
{
	let current,
			restore = (reason == ADDON_DISABLE || reason == ADDON_UNINSTALL),
			backup = (reason == ADDON_ENABLE || reason == ADDON_INSTALL);
	for(let i = 0; i < options.length; i++)
	{
		if (restore)
		{
			try
			{
				current = Services.prefs.getBoolPref(PREF_BRANCH + PREF_DEFAULT_BRANCH + options[i][0]);
				try{Services.prefs.setBoolPref(options[i][0], current)}catch(e){};
			}
			catch(e)
			{
				try{Services.prefs.clearUserPref(options[i][0])}catch(e){};
			}
		}
		else
		{
			try
			{
				current = Services.prefs.getBoolPref(options[i][0]);
			}
			catch(e)
			{
				current = null;
			}
			try
			{
				Services.prefs.setBoolPref(options[i][0], options[i][1]);
			}
			catch(e)
			{
				dump("unable set " + options[i][0] + "\n" + e);
			}
			if (current != null && backup)
				Services.prefs.setBoolPref(PREF_BRANCH + PREF_DEFAULT_BRANCH + options[i][0], current);

		}
	}
}

function onPrefChange(pref, aTopic, key)
{
	if (aTopic != "nsPref:changed")
		return;

	for(let i = 0; i < options.length; i++)
		if (key == options[i][0])
		{
			Services.prefs.setBoolPref(PREF_BRANCH + PREF_DEFAULT_BRANCH + key, Services.prefs.getBoolPref(key));
			return;
		}
}

function dump(e)
{
	Components.classes["@mozilla.org/consoleservice;1"]
		.getService(Components.interfaces.nsIConsoleService)
		.logStringMessage("DeveloperProfile: " + e);
}

function startup(data, reason)
{
	AddonManager.getAddonByID(data.id, function(addon)
	{
		if (reason == APP_STARTUP)
		{
			let version;
			try
			{
				version = Services.prefs.getCharPref(PREF_BRANCH + "version");
			}
			catch(e)
			{
				Services.prefs.setCharPref(PREF_BRANCH + "version", addon.version);
				reason = ADDON_INSTALL;
			}
		}
		set(reason);
		Services.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2).addObserver('', onPrefChange, false);
	});
}

function shutdown(data, reason)
{
	Services.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2).removeObserver('', onPrefChange, false);
	set(reason);
}

function install(data, reason)
{
}

function uninstall(data, reason)
{
	Services.prefs.deleteBranch(PREF_BRANCH);
}
