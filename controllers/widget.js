var args = arguments[0] || {};
var LCAT = "Ti.FormBuilder";

/////////////////////////
// Requirements checks //
/////////////////////////

if (Ti.Trimethyl == null) {
	throw new Error(LCAT + ": you need to install Trimethyl to use this widget.");
}

var UIFactory = require('T/uifactory');
if (UIFactory == null) throw new Error(LCAT + ": you need the UIFactory module to use this widget");

var UIFactoryTextField = require('T/uifactory/textfield');
if (UIFactoryTextField == null) throw new Error(LCAT + ": you need the UIFactory.TextField module to use this widget");

var Dialog = require('T/dialog');
if (Dialog == null) throw new Error(LCAT + ": you need the Dialog module to use this widget");

////////////////
// Properties //
////////////////

var fields = args.fields;
var fields_map = [];

/////////////
// Methods //
/////////////

function addValidationError(f, msg) {
	f.uiValidation.text = msg;
	f.uiValidation.animate({ opacity: 1 });
}

function submit() {
	var obj = {};
	fields_map.forEach(function(f) {
		obj[f.name] = _.isFunction(f.getValue) ? f.getValue() : f.ui.getValue();
	});

	$.trigger('submit', {
		data: obj
	});
}

////////////////////
// Public methods //
////////////////////

$.submit = function() {
	Dialog.option(L("form_submit_prompt", "Do you want to submit the form?"), [
		{
			title: L("form_submit", "Submit"),
			callback: function() {
				submit();
			}
		},
		{
			title: L("form_cancel", "Cancel"),
			cancel: true
		}
	]);
};

$.validate = function() {
	var can_submit = true;

	_.each(fields_map, function(f, k) {
		var def = fields[k];
		var current_value = _.isFunction(f.getValue) ? f.getValue() : f.ui.getValue();

		Ti.API.debug(f.name, current_value);

		// Required validation
		if (def.required) {
			var requiredValue = false;
			if (_.isBoolean(current_value)) {
				requiredValue = !!current_value;
			} else {
				requiredValue = !_.isEmpty(current_value);
			}

			if (requiredValue !== true) {
				if (_.isFunction(f.addError)) f.addError();
				addValidationError(f, L("form_required_field", "Required field"));
				can_submit = false;
				Ti.API.error(f.name, 'required');
				return false;
			}
		}

		// Validation custom
		if (_.isFunction(def.validator)) {
			var validMessage = def.validator(f.ui.value || '');
			if (validMessage !== true) {
				if (_.isFunction(f.addError)) f.addError();
				addValidationError(f, validMessage);
				can_submit = false;
				Ti.API.error(f.name, 'invalid');
				return false;
			}
		}

		Ti.API.info(f.name, 'success');

		if (_.isFunction(f.removeError)) f.removeError();
		f.uiValidation.applyProperties({ text: "", opacity: 0 });
	});

	return can_submit;
};

////////////////
// UI Builder //
////////////////

exports.UIBuilder = {};

exports.UIBuilder.text = function(e,f) {
	f.ui = UIFactoryTextField(_.extend({}, $.createStyle({ classes: ['formInput'] }), {
		textType: e.type,
		hintText: e.placeholder,
		returnKeyType: Titanium.UI.RETURNKEY_NEXT
	}));

	f.addError = function() { $.resetClass(f.ui, "formInput formInputError"); };
	f.removeError = function() { $.resetClass(f.ui, "formInput"); };

	f.ui.addEventListener('return', function(e) {
		$.validate();
		for (var i = f.index; i < fields_map.length; i++) {
			if (_.isEmpty(fields_map[i].ui.getValue())) {
				if (_.isFunction(fields_map[i].ui.focus)) {
					fields_map[i].ui.focus();
					return;
				}
			}
		}
	});
};

exports.UIBuilder.boolean = function(e,f) {
	var switcher = $.UI.create('Switch', {
		value: false,
		left: 0,
	});
	var label = $.UI.create('Label', {
		left: 60,
		right: 0,
		text: e.placeholder
	});

	f.ui = Ti.UI.createView();
	f.ui.add(switcher);
	f.ui.add(label);

	f.getValue = function() { return switcher.getValue(); };
};

//////////////////
// Parse fields //
//////////////////

var index = 0;

_.each(_.groupBy(fields, 'group'), function(subFields, k) {
	$.formMainView.add($.UI.create('Label', {
		classes: ['formGroupLabel'],
		text: k
	}));
	$.formMainView.add($.UI.create('View', {
		classes: ['formGroupSeparator']
	}));
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

		if (e.type === 'boolean') {
			exports.UIBuilder.boolean(e,f);
		} else {
			exports.UIBuilder.text(e,f);
		}

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

var $submit_btn = $.UI.create('Button', {
	classes: ['formSubmitButton']
});

$submit_btn.addEventListener('click', function(e) {
	if ($.validate()) {
		$.submit();
	}
});

$.formMainView.add($submit_btn);
