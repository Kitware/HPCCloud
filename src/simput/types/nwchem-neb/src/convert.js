/* eslint-disable */
var template = require('./templates/output.hbs');

module.exports = function (model) {
    var templateData = { data: {}, valid: true , errors: []},
        viewInstance = null,
        count = 0,
        list = null;

    console.log('model: ', model);

    function get(obj, prop) {
      try {
        var ret = obj[prop].value[0];
        return ret;
      } catch (e) {
        return null;
      }
    }

    var dft = model.data.dft[0].dft,
        basis = model.data.basis[0].basis,
        neb = model.data.neb[0].neb;

    templateData.data.dft_maxiter = get(dft, 'dft.maxiter');

    var theoryLib = get(basis, 'basis.theory_basis');
    templateData.data.theory_basis = theoryLib;
    if (['cc-pVDZ', 'cc-pVTZ'].indexOf(theoryLib) !== -1) {
        templateData.data.basis = 'spherical';
    }

    templateData.data.nbeads = get(neb, 'neb.nbeads');
    templateData.data.kbeads = get(neb, 'neb.kbeads');
    templateData.data.maxiter = get(neb, 'neb.maxiter');
    templateData.data.stepsize = get(neb, 'neb.stepsize');

    templateData.data.start_geometry = get(model, 'startGeometry');
    templateData.data.end_geometry = get(model, 'endGeometry');

    console.log('template:', templateData);
    var ret = {
        errors: templateData.errors,
        model: model,
        results: {}
    };
    ret.results['job.nw'] =  template(templateData.data);

    return ret;
}
