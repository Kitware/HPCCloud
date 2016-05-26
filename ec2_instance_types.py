import json
from jsonpath_rw_ext import parse
import requests
import codecs

REGIONS_MAP = {
    'US West (N. California)': 'us-west-1',
    'Asia Pacific (Tokyo)': 'ap-northeast-1',
    'Asia Pacific (Seoul)': 'ap-northeast-2',
    'US West (Oregon)': 'us-west-2',
    'South America (Sao Paulo)': 'sa-east-1',
    'US East (N. Virginia)': 'us-east-1',
    'Asia Pacific (Singapore)': 'ap-southeast-1',
    'EU (Frankfurt)': 'eu-central-1',
    'EU (Ireland)': 'eu-west-1',
    'Asia Pacific (Sydney)': 'ap-southeast-2'
}

URL = 'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json'

def generate_instance_types_json():

    r = requests.get(URL, stream=True)
    r.encoding = 'utf-8'
    costs = json.load(codecs.getreader("utf-8")(r.raw))

    products = [ p.value for p in parse('products.*').find(costs)]

    # Only interested in Linux
    linux_products = [ p.value for p in parse('@[?(attributes.operatingSystem == "Linux")]').find(products)]

    instance_types_json = {}

    for p in linux_products:
        attributes = p['attributes']

        # For now exclude dedicated and host tenancy
        if attributes['tenancy'] != 'Shared':
            continue

        if attributes['location'] not in REGIONS_MAP:
            continue

        location = instance_types_json.setdefault(REGIONS_MAP[attributes['location']], {})

        instance = {
            'id': attributes['instanceType'],
            'cpu': attributes['vcpu'],
            'memory': attributes['memory'],
            'storage': attributes['storage'],
            'family': attributes['instanceFamily']
        }

        # N.B. Only do this partial in jsonpath otherwise we get errors :-(
        # The following path doesn't work for some reason.
        # 'terms.OnDemand.%s.*.priceDimensions.*.pricePerUnit.USD' % p['sku']
        on_demand = costs['terms']['OnDemand']
        path = '*.priceDimensions.*.pricePerUnit.USD'

        instance['price'] =  parse(path).find(on_demand[p['sku']])[0].value

        gpu = 0
        if 'gpu' in attributes:
            gpu = attributes['gpu']
        instance['gpu'] = gpu

        family = location.setdefault(attributes['instanceFamily'], [])
        family.append(instance)

    class sort_key(object):
        def __init__(self, obj, *args):
            self.obj = obj

        def _cmp(self, other):
            if int(self.obj['cpu']) < int(other['cpu']):
                return -1
            elif int(self.obj['cpu']) > int(other['cpu']):
                return 1

            if self.obj['memory'] < other['memory']:
                return -1
            elif self.obj['memory'] > other['memory']:
                return 1

            if int(self.obj['gpu']) < int(other['gpu']):
                return -1
            elif int(self.obj['gpu']) > int(other['gpu']):
                return 1

            return 0

        def __lt__(self, other):
            return self._cmp(other.obj) < 0

        def __gt__(self, other):
            return self._cmp(other.obj) > 0

        def __eq__(self, other):
            return self._cmp(other.obj) == 0

        def __le__(self, other):
            return self._cmp(other.obj) <= 0

        def __ge__(self, other):
            return self._cmp(other.obj) >= 0

        def __ne__(self, other):
            return self._cmp(other.obj) != 0

    # Sort the families based on number of cpus and memory
    for region in instance_types_json:
        for family in instance_types_json[region]:
            instance_types_json[region][family].sort(key=sort_key)

    print (json.dumps(instance_types_json))

if __name__ == "__main__":
    generate_instance_types_json()
