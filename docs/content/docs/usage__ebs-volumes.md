# EBS Volumes

Complementing the ability to create and run simulations on AWS EC2 instances, HPCCloud also supports mounting of AWS Elastic Block Store (EBS) volumes to provide input and to store output for these simulations. Volumes can also be reused between EC2 instances. For example, you could run a resource intensive simulation on a large expensive cluster and map its output to a EBS volume. You could then use that same volume as input for a visualization job on a smaller cluster which is not as expensive.

## Creating New Volumes

There are two methods to create new volumes. Through the preference panel and a taskflow run:

### Preferences Panel

Volumes created here are not instantiated on AWS but are available to select when starting a new taskflow. To create one you need a valid AWS profile already created and available.

### Taskflow Run

On a run panel there are three fields for volumes, these fields are only available on the with EC2 server type is selected. You can either select an existing volume or you can create a new one by specifying the name and the size. Existing volumes have either been used in previous taskflows or were created from the Preference panel, they must be in the detached or available state. If you provide a volume name and size a volume will be created and attached to the cluster.

## Removing Volumes

To remove a volume the volume needs to be in either the detached or available state. You do so from the volume preference page with the delete button. 