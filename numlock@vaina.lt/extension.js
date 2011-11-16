const St = imports.gi.St;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;
const Main = imports.ui.main;
const Keymap = imports.gi.Gdk.Keymap;

//imports.gi.Gdk.Keymap.get_default().get_num_lock_state();

const Gettext = imports.gettext;
const _ = Gettext.gettext;

let indicator;

function main() {
	init();
	enable();
}

function init() {
	indicator = new NumlockIndicator();
}

function enable() {
	Main.panel._rightBox.insert_actor(indicator.actor,  0);
}

function disable() {
	Main.panel._rightBox.remove_actor(indicator.actor);
}

function NumlockIndicator() {
   this._init();
}

NumlockIndicator.prototype = {
	__proto__: PanelMenu.Button.prototype,

	_init: function() {
		PanelMenu.Button.prototype._init.call(this, St.Align.START);

		this.label = new St.Label({ text: '1'});
		this.actor.add_actor(this.label);
		this.menuItem = new PopupMenu.PopupSwitchMenuItem(_('Numlock'), false);
		this.menu.addMenuItem(this.menuItem);

		this._updateState();
		Keymap.get_default().connect('state-changed', Lang.bind(this, this._updateState));
	},

	_updateState: function(actor, event) {
		//this.label.set_text( this._getNumlockStateText() );
		this.label.set_style_class_name( this._getNumlockStateClassName() );
		this.menuItem.setToggleState( this._getNumlockState() );
	},

	_getNumlockStateClassName: function() {
		return this._getNumlockState() ? 'numlock-state-enabled' : 'numlock-state-disabled';
	},

	 _getNumlockStateText: function() {
		return this._getNumlockState() ? _('On') : _('Off');
	},

	 _getNumlockState: function() {
		return Keymap.get_default().get_num_lock_state();
	},
}
