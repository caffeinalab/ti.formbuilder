var args = arguments[0] || {};
_.defaults(args, {
	showSubmitButton: true,
	askBeforeSubmit: false,
	submitTitle: L('form_submit', 'Submit')
});

var LCAT = "Ti.FormBuilder";

/////////////////////////
// Requirements checks //
/////////////////////////

if (Alloy.Globals.Trimethyl == null) {
	throw new Error(LCAT + ": you need to install Trimethyl to use this widget.");
}

var UIFactory = require('T/uifactory');
if (UIFactory == null) throw new Error(LCAT + ": you need the UIFactory module to use this widget");

var UIFactoryTextField = require('T/uifactory/textfield');
if (UIFactoryTextField == null) throw new Error(LCAT + ": you need the UIFactory.TextField module to use this widget");

var UIFactoryLabel = require('T/uifactory/label');
if (UIFactoryLabel == null) throw new Error(LCAT + ": you need the UIFactory.Label module to use this widget");

var UIFactorySelect = require('T/uifactory/select');
if (UIFactorySelect == null) throw new Error(LCAT + ": you need the UIFactory.Select module to use this widget");

var UIFactoryTimeSelect = require('T/uifactory/timeselect');
if (UIFactoryTimeSelect == null) throw new Error(LCAT + ": you need the UIFactory.TimeSelect module to use this widget");

var Dialog = require('T/dialog');
if (Dialog == null) throw new Error(LCAT + ": you need the Dialog module to use this widget");

////////////////
// Properties //
////////////////

var fields = args.fields;
var fields_map = [];

var submitting = false;

/////////////
// Methods //
/////////////

function addValidationError(f, msg) {
	f.uiValidation.text = msg;
	f.uiValidation.animate({
		opacity: 1,
	});

	if (_.isFunction(f.addError)) f.addError();
}

function removeValidationError(f) {
	f.uiValidation.text = "";
	f.uiValidation.animate({
		opacity: 1,
	});

	if (_.isFunction(f.removeError)) f.removeError();
}

function submit() {
	var obj = {};
	fields_map.forEach(function(f) {
		if (f.name) {
			obj[f.name] = _.isFunction(f.getValue) ? f.getValue() : f.ui.getValue();
		}
	});

	submitting = true;
	$.formMainView.touchEnabled = false;

	$.trigger('submit', {
		data: obj
	});
}

////////////////////
// Public methods //
////////////////////

$.endSubmit = function() {
	submitting = false;
	$.formMainView.touchEnabled = true;
};

$.submit = function() {
	if (args.askBeforeSubmit) {
		Dialog.option(L("form_submit_prompt", "Do you want to submit the form?"), [
		{
			title: L("form_submit", "Submit"),
			callback: function() {
				if ($.validate()) submit();
			}
		},
		{
			title: L("form_cancel", "Cancel"),
			cancel: true
		}
		]);
	} else {
		if ($.validate()) submit();
	}
};

$.validate = function() {
	var can_submit = true;
	var field_to_focus = null;

	_.each(fields_map, function(f, k) {
		var def = fields[k];
		var current_value = _.isFunction(f.getValue) ? f.getValue() : f.ui.getValue();

		// Required validation
		if (def.required) {
			var requiredValue = false;
			if (_.isBoolean(current_value)) {
				requiredValue = !!current_value;
			} else {
				requiredValue = !_.isEmpty(current_value);
			}

			if (requiredValue !== true) {
				addValidationError(f, L("form_required_field", "Required field"));
				can_submit = false;
				field_to_focus = field_to_focus || f;
				return false;
			}
		}

		// Validation custom
		if (_.isFunction(def.validator)) {
			var validMessage = def.validator(f.ui.value || '');
			if (validMessage !== true) {
				addValidationError(f, validMessage);
				can_submit = false;
				field_to_focus = field_to_focus || f;
				return false;
			}
		}

		removeValidationError(f);
	});

	if (field_to_focus != null) {
		if (_.isFunction(field_to_focus.focus)) {
			field_to_focus.focus();
		} else if (_.isFunction(field_to_focus.ui.focus)) {
			field_to_focus.ui.focus();
		}
	}

	return can_submit;
};

////////////////
// UI Builder //
////////////////

exports.UIBuilder = {};

exports.UIBuilder.text = function(e,f) {
	f.ui = UIFactoryTextField(_.extend({}, $.createStyle({ classes: ['formInput'], apiName: 'TextField' }), {
		textType: e.type,
		hintText: e.placeholder,
		value: e.value,
		returnKeyType: Titanium.UI.RETURNKEY_NEXT
	}));

	f.addError = function() { $.addClass(f.ui, "formInputError"); };
	f.removeError = function() { $.removeClass(f.ui, "formInputError"); };

	f.ui.addEventListener('return', $.validate);
};

exports.UIBuilder.boolean = function(e,f) {
	var switcher = Ti.UI.createSwitch({
		value: e.value,
		left: 0
	});
	var label = UIFactoryLabel(_.extend({}, $.createStyle({ classes: ['formBooleanLabel'], 'apiName':'Label' }), {
		left: 60,
		right: 0,
		html: e.placeholder
	}));

	f.ui = Ti.UI.createView();
	f.ui.add(switcher);
	f.ui.add(label);

	f.getValue = function() { return switcher.getValue(); };
};

exports.UIBuilder.select = function(e,f) {
	f.ui = UIFactorySelect(_.extend({}, $.createStyle({ classes: ['formInput'], apiName: 'Select' }), {
		values: e.values,
		value: e.value,
		hintText: e.placeholder
	}));

	f.addError = function() { $.addClass(f.ui, "formInputError"); };
	f.removeError = function() { $.removeClass(f.ui, "formInputError"); };

	f.ui.addEventListener('change', $.validate);
};

exports.UIBuilder.time = function(e,f) {
	f.ui = UIFactoryTimeSelect(_.extend({}, $.createStyle({ classes: ['formInput'], apiName: 'TimeSelect' }), {
		value: e.value,
		hintText: e.placeholder
	}));

	f.addError = function() { $.addClass(f.ui, "formInputError"); };
	f.removeError = function() { $.removeClass(f.ui, "formInputError"); };

	f.ui.addEventListener('change', $.validate);
};

//////////////////
// Parse fields //
//////////////////

var index = 0;

_.each(_.groupBy(fields, 'group'), function(subFields, k) {
	if (k !== "undefined") {
		$.formMainView.add($.UI.create('Label', {
			classes: ['formGroupLabel'],
			text: k
		}));
		$.formMainView.add($.UI.create('View', {
			classes: ['formGroupSeparator']
		}));
	}

	$.formMainView.add(Ti.UI.createView({ height: 8 }));

	subFields.forEach(function(e) {
		var $wrap = $.UI.create('View', {
			classes: ['formWrap']
		});
		$wrap.add($.UI.create('Label', {
			classes: ['formLabel'],
			text: e.label
		}));

		var f = {
			name: e.name,
			index: (index++)
		};

		var factory = exports.UIBuilder[ e.type ] || exports.UIBuilder.text;
		factory(e,f);

		f.uiValidation = $.UI.create('Label', {
			text: '',
			opacity: 0,
			classes: ['formValidatorMessage']
		});

		$wrap.add(f.ui);
		$wrap.add(f.uiValidation);
		$.formMainView.add($wrap);

		fields_map.push(f);
	});
});

if (args.showSubmitButton == true) {
	var $submit_btn = $.UI.create('Button', {
		classes: ['formSubmitButton'],
		title: args.submitTitle
	});

	$submit_btn.addEventListener('click', function(e) {
		if (submitting) return;
		$.submit();
	});

	$.formMainView.add($submit_btn);
}
