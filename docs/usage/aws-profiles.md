# AWS Profiles

AWS profiles allow you to provision and run simulations on Amazon EC2 instances.

## Creating 

Click the "+" icon in the toolbar. You'll be presented a blank form in which you can fill out details of your AWS profile. Most important are AWS key and secret key (do not share these keys with anyone and especially don't commit them to a repository, much less this one). If necessary select a different machine type and region, the cheapest machine type per hour (Nano instance) and US-East(a) are selected by default. Click "Save Profile" and your AWS credentials will be validated, and if valid: saved. Your profile will be added to the list in the sidebar and you can now provision and launch EC2 instances from a Simulation Start view in a workflow.

## Editing

You cannot edit saved AWS profiles.

## Deleting

With the profile you want to delete selected, click "Delete profile." You will be prompted before the profile is deleted. This will not terminate still running instances associated with the profile. You will also not be able to access files generated from simulations which ran on instances using this profile, readding the profile will not allow you to do this either.