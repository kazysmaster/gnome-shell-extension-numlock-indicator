const St = imports.gi.St;
const Lang = imports.lang;
const Gettext = imports.gettext;
const _ = Gettext.gettext;

const Keymap = imports.gi.Gdk.Keymap;

const Panel = imports.ui.panel;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const MessageTray = imports.ui.messageTray;

let indicator;

function main() {
	init();
	enable();
}

function init() {
	indicator = new NumlockIndicator();
}

function enable() {
	//Main.panel.addToStatusArea('numlock', indicator, getPreferredIndex());
	Main.panel._rightBox.insert_actor(indicator.actor,  getPreferredIndex());
	Main.panel._menus.addMenu(indicator.menu);
}

function disable() {
	//indicator.destroy();
	Main.panel._rightBox.remove_actor(indicator.actor);
	Main.panel._menus.removeMenu(indicator.menu);
}

function getPreferredIndex() {
	//just before xkb layout indicator
	if (Main.panel._statusArea['keyboard'] != null) {
		let xkb = Main.panel._statusArea['keyboard'];
		let children = Main.panel._rightBox.get_children();
		
		for (let i = children.length - 1; i >= 0; i--) {
			//global.log("i:" + i + " role pos " +  children[i]._rolePosition);
			if(xkb == children[i]._delegate){
				//return children[i]._rolePosition;
				return i;
			}
		}
	}
    return 0;
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
		Keymap.get_default().connect('state-changed', Lang.bind(this, this._handleStateChange));
	},
	
	_handleStateChange: function(actor, event) {
		if (this.numlock_state != this._getNumlockState()) {
			this._showNotification();
		}
		this._updateState();
	}, 

	_updateState: function() {
		this.numlock_state = this._getNumlockState();
		this.label.set_style_class_name( this._getNumlockStateClassName() );
		this.menuItem.setToggleState( this._getNumlockState() );
	},
	
	_getNumlockStateClassName: function() {
		return this._getNumlockState() ? 'numlock-state-enabled' : 'numlock-state-disabled';
	},
	
	_showNotification: function() {
		this._prepareSource();
		
		let notification_text = _('Numlock') + ' ' + this._getNumlockStateText();
		let notification = null;
		if (this._source.notifications.length == 0) {
			notification = new MessageTray.Notification(this._source, notification_text);
			notification.setTransient(true);
			notification.setResident(false);
		} else {
			notification = this._source.notifications[0];
            notification.update(notification_text, null, { clear: true });
		}
		
		this._source.notify(notification);
	},
	
	_prepareSource: function() {
		if (this._source == null) {
			this._source = new MessageTray.SystemNotificationSource();
			this._source.createNotificationIcon = function() {
				return new St.Icon({ icon_name: 'input-keyboard',
									 icon_type: St.IconType.SYMBOLIC,
									 icon_size: this.ICON_SIZE });
			};
			this._source.connect('destroy', Lang.bind(this,
				function() {
					this._source = null;
				}));
			Main.messageTray.add(this._source);
		}
	},

	 _getNumlockStateText: function() {
		return this._getNumlockState() ? _('On') : _('Off');
	},

	 _getNumlockState: function() {
		return Keymap.get_default().get_num_lock_state();
	},
}
