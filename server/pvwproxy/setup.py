from setuptools import setup, find_packages

setup(
    name='pvwproxy-plugin',
    version='1.0.0',
    description='Exposes REST api to add entries to ParaViewWebs proxy file',
    packages=find_packages(),
    install_requires=[
      'girder>=3.0.0a5'
    ],
    entry_points={
      'girder.plugin': [
          'pvwproxy_plugin = pvwproxy_plugin:PVWProxyPlugin'
      ]
    }
)
