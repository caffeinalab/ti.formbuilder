# Ti.FormBuilder

### com.caffeinalab.titanium.formbuilder

*You're a developer, and the most annoying thing you can do are forms.*

So, let's build forms with just an object literal.

#### Via Gittio

```
gittio install com.caffeinalab.titanium.formbuilder
```

#### Via Github

Download the latest release and add in your *config.json*, under `dependencies`:

```json
"dependencies": {
    "com.caffeinalab.titanium.formbuilder": "*"
}
```

#### Usage

```js
var form = Alloy.createWidget('com.caffeinalab.titanium.formbuilder', {
	fields: [
		{ name: 'first_name' },
		{ name: 'last_name' },
		// See below
	]
});
```

#### Options

##### `askBeforeSubmit (Boolean)`: Show an option dialog before the real submit

##### `submitTitle (String)`: The title of the submit button

#### Options for the field

##### `name (String)`: The name (ID) of this field

##### `type (String)`: The type of this field

Possible values are:

* `text`
* `password`
* `passwordEye`
* `email`
* `boolean`

##### `label (String)`: The text of the label to show above the input

##### `group (String)`: A text used to group similar inputs

##### `placeholder (String)`: A placeholder for the input

##### `required (Boolean)`: Indicate the field is required and will throw validation errors

##### `validator (Function)`: A custom validator function.

It must return `true` if everything's ok, a message string otherwise.

#### Sample fields definition

```
var fields = [
{
	name: 'email',
	type: 'email',
	label: 'EMAIL',
	placeholder: 'mario.rossi@gmail.com',
	group: 'I tuoi dati di accesso',
	required: true,
	validator: function(value) {
		if (!/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i.test(value)) {
			return "Email non valida";
		}
		return true;
	}
},
{
	name: 'password',
	type: 'passwordEye',
	label: 'LA TUA PASSWORD',
	placeholder: 'Password',
	group: 'I tuoi dati di accesso',
	required: true,
	validator: function(value) {
		if (value.length < 8) return "Inserisci una password di almeno 8 caratteri";
		return true;
	}
},
{
	name: 'first_name',
	type: 'text',
	label: 'NOME',
	placeholder: 'Mario',
	required: true,
	group: 'Le tue informazioni personali'
},
{
	name: 'privacy',
	type: 'boolean',
	label: 'PRIVACY POLICY',
	placeholder: 'Ho letto e accettato la privacy policy',
	required: true,
	group: 'Consenso'
}
];
```

#### Fully stylable via Alloy theme

Just overwrite classes with `app/themes/YOURTHEME/com.caffeinalab.titanium.formbuilder/styles/widget.tss`

## Contributing

How to get involved:

1. [Star](https://github.com/CaffeinaLab/Ti.FormBuilder/stargazers) the project!
2. Answer questions that come through [GitHub issues](https://github.com/CaffeinaLab/Ti.FormBuilder/issues?state=open)
3. [Report a bug](https://github.com/CaffeinaLab/Ti.FormBuilder/issues/new) that you find

Pull requests are **highly appreciated**.

Solve a problem. Features are great, but even better is cleaning-up and fixing issues in the code that you discover.

## Copyright and license

Copyright 2015 [Caffeina](http://caffeinalab.com) srl under the [MIT license](LICENSE).
