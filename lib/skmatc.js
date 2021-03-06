var _ = require('lodash');

var Validator = require('./Validator.js'),
    Result = require('./Result.js'),
    Failure = require('./Failure.js');

module.exports = skmatc;

function skmatc (schema) {
    /// <summary>Creates a new skmatc validator for the given schema</summary>
    /// <param name="schema" type="Object">The schema to validate data against</param>

    this.schema = schema;
    this.validators = skmatc.validators.map(function(module) { return module(this); }, this);
}

skmatc.Validator = Validator;
skmatc.Result = Result;
skmatc.Failure = Failure;

skmatc.create = Validator.create;
skmatc.scope = function (schema) {
    return new skmatc(schema);
};

skmatc.prototype.validate = function(data, path) {
    /// <signature>
    /// <summary>Validates the given data against this schema</summary>
    /// <param name="data" type="Object">The object to validate against this schema</param>
    /// <param name="path" type="String" optional="true">The path used as the root for error messages</param>
    /// <returns type="Result"/>
    /// </signature>

    return skmatc.validate(this.validators, this.schema, data, path);
};

skmatc.prototype.register = function(validator) {
    /// <signature>
    /// <summary>Registers the specified validator with skmatc</summary>
    /// <param name="validator" type="Function">The validator module to add to this skmatc instance</param>
    /// </signature>
    /// <signature>
    /// <summary>Registers the specified validator with skmatc</summary>
    /// <param name="validator" type="Validator">The validator to add to this skmatc instance</param>
    /// </signature>

    if(validator instanceof Validator)
        this.validators.push(validator);
    else this.validators.push(validator(this));
};

skmatc.validate = function(validators, schema, data, path) {
    /// <summary>Validates the given data against the provided schema</summary>
    /// <param name="validators" type="Array" elementType="Validator">The validators to use</param>
    /// <param name="schema" type="Mixed">The schema against which to validate</param>
    /// <param name="data" type="Object">The object to validate against the provided schema</param>
    /// <param name="path" type="String" optional="true">The path used as the root for error messages</param>
    /// <returns type="Result"/>

    for(var i = 0; i < validators.length; i++) {
        if(validators[i].handles(schema)) {
            var result = new Result(validators[i].validate(schema, data, path));
            return result;
        }
    }

    return new Result();
};

skmatc.register = function(validator) {
    /// <summary>Registers the specified validator with skmatc</summary>
    /// <param name="validator" type="Function">The validator module to add to skmatc</param>

    if(validator instanceof Validator) throw new Error('Expected a validator module for global inclusion');

    skmatc.validators.push(validator);
};

/// <var type="Array" elementValue="Validator.module(null, null)">Global validators to be used by skmatc instances in order of precidence</var>
skmatc.validators = [
    require('./Validators/ControlWrapper.js'),
    require('./Validators/BasicValidator.js'),
    require('./Validators/ObjectValidator.js'),
    require('./Validators/ArrayValidator.js'),
    require('./Validators/TypeValidators.js'),
    require('./Validators/RegExValidator.js')
];