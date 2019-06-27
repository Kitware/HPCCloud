from setuptools import setup, find_packages

setup(
    name='hpccloud-plugin',
    version='1.0.0',
    description='Girder plugin to support HPCCloud projects and simulations',
    packages=find_packages(),
    install_requires=[
      'girder>=3.0.0a5'
    ],
    entry_points={
      'girder.plugin': [
          'hpccloud_plugin = hpccloud_plugin:HPCCloudPlugin'
      ]
    }
)
