/* -*- js-indent-level: 8 -*- */
/*
 * L.Control.Notebookbar
 */

/* global $ _ */
L.Control.Notebookbar = L.Control.extend({

	_currentScrollPosition: 0,
	_showNotebookbar: false,

	onAdd: function (map) {
		this.map = map;
		this._currentScrollPosition = 0;

		this.loadTab(this.getHomeTab());

		this.createScrollButtons();
		this.setupResizeHandler();

		this.map.on('contextchange', this.onContextChange, this);
		this.map.on('notebookbar', this.onNotebookbar, this);
		this.map.on('updatepermission', this.onUpdatePermission, this);

		$('.main-nav').addClass('hasnotebookbar');
	},

	onRemove: function() {
		this.map.off('contextchange', this.onContextChange, this);
		this.map.off('updatepermission', this.onUpdatePermission, this);
		this.map.off('notebookbar');
		this.clearNotebookbar();
	},

	onUpdatePermission: function(e) {
		if (e.perm === 'edit') {
			this._showNotebookbar = true;
			this.showTabs();
		}
	},

	onNotebookbar: function(data) {
		this.loadTab(data);
	},

	showTabs: function() {
		$('.ui-tabs.notebookbar').show();
		$('.notebookbar-shortcuts-bar').show();
	},

	hideTabs: function() {
		$('.ui-tabs.notebookbar').hide();
		$('.notebookbar-shortcuts-bar').hide();
	},

	clearNotebookbar: function() {
		$('.root-container.notebookbar').remove();
		$('.ui-tabs.notebookbar').remove();
		$('.notebookbar-scroll-wrapper').remove();
	},

	loadTab: function(tabJSON) {
		this.clearNotebookbar();
		var builder = new L.control.notebookbarBuilder({mobileWizard: this, map: this.map, cssClass: 'notebookbar'});

		var parent = $('#toolbar-up').get(0);
		var container = L.DomUtil.create('div', 'notebookbar-scroll-wrapper', parent);

		builder.build(container, [tabJSON]);

		if (this._showNotebookbar === false)
			this.hideTabs();

		this.scrollToLastPositionIfNeeded();
	},

	setTabs: function(tabs) {
		$('nav').prepend(tabs);
		this.createShortcutsBar();
	},

	selectedTab: function() {
		// implement in child classes
	},
	
	getTabs: function() {
		// implement in child classes
		return [];
	},

	getShortcutsBarData: function() {
		return [
			{
				'id': 'shortcutstoolbox',
				'type': 'toolbox',
				'children': [
					{
						'type': 'toolitem',
						'text': _('Save'),
						'command': '.uno:Save'
					},
					{
						'type': 'toolitem',
						'text': _('Undo'),
						'command': '.uno:Undo'
					},
					{
						'type': 'toolitem',
						'text': _('Redo'),
						'command': '.uno:Redo'
					}
				]
			}
		];
	},

	createShortcutsBar: function() {
		var shortcutsBar = L.DomUtil.create('div', 'notebookbar-shortcuts-bar');
		$('nav').prepend(shortcutsBar);

		var builder = new L.control.notebookbarBuilder({mobileWizard: this, map: this.map, cssClass: 'notebookbar'});
		builder.build(shortcutsBar, this.getShortcutsBarData());
	},

	setCurrentScrollPosition: function() {
		this._currentScrollPosition = $('.notebookbar-scroll-wrapper').scrollLeft();
	},

	scrollToLastPositionIfNeeded: function() {
		var rootContainer = $('.notebookbar-scroll-wrapper table').get(0);

		if (this._currentScrollPosition && $(rootContainer).outerWidth() > $(window).width()) {
			$('.notebookbar-scroll-wrapper').animate({ scrollLeft: this._currentScrollPosition }, 0);
		} else {
			$(window).resize();
		}
	},

	createScrollButtons: function() {
		var parent = $('#toolbar-up').get(0);

		var left = L.DomUtil.create('div', 'w2ui-scroll-left', parent);
		var right = L.DomUtil.create('div', 'w2ui-scroll-right', parent);

		$(left).css({'height': '80px'});
		$(right).css({'height': '80px'});

		$(left).click(function () {
			var scroll = $('.notebookbar-scroll-wrapper').scrollLeft() - 300;
			$('.notebookbar-scroll-wrapper').animate({ scrollLeft: scroll }, 300);
			setTimeout(function () { $(window).resize(); }, 350);
		});

		$(right).click(function () {
			var scroll = $('.notebookbar-scroll-wrapper').scrollLeft() + 300;
			$('.notebookbar-scroll-wrapper').animate({ scrollLeft: scroll }, 300);
			setTimeout(function () { $(window).resize(); }, 350);
		});
	},

	setupResizeHandler: function() {
		var handler = function() {
			var container = $('#toolbar-up').get(0);
			var rootContainer = $('.notebookbar-scroll-wrapper table').get(0);

			if ($(rootContainer).outerWidth() > $(window).width()) {
				// we have overflowed content
				if ($('.notebookbar-scroll-wrapper').scrollLeft() > 0)
					$(container).find('.w2ui-scroll-left').show();
				else
					$(container).find('.w2ui-scroll-left').hide();

				if ($('.notebookbar-scroll-wrapper').scrollLeft() < $(rootContainer).outerWidth() - $(window).width() - 1)
					$(container).find('.w2ui-scroll-right').show();
				else
				$(container).find('.w2ui-scroll-right').hide();
			} else {
				$(container).find('.w2ui-scroll-left').hide();
				$(container).find('.w2ui-scroll-right').hide();
			}
		};

		$(window).resize(handler);
		$('.notebookbar-scroll-wrapper').scroll(handler);
	},

	onContextChange: function(event) {
		var tabs = this.getTabs();
		for (var tab in tabs) {
			if (tabs[tab].context) {
				var contexts = tabs[tab].context.split('|');
				for (var context in contexts) {
					if (contexts[context] === event.context) {
						$('#' + tabs[tab].name).click();
					}
				}
			}
		}
	}
});
