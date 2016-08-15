# AWS Profiles

AWS profiles allow you to provision and run simulations on Amazon EC2 instances.

In order for an AWS user to be able to use HPCCloud with EC2 the user must have
been granted permissions to perform certain EC2 related actions. The example
policy document below outlines the minium set of operations that are required.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1450036931200",
            "Effect": "Allow",
            "Action": [
                "ec2:RunInstances",
                "ec2:StartInstances",
                "ec2:StopInstances",
                "ec2:TerminateInstances",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:CreateKeyPair",
                "ec2:CreateSecurityGroup",
                "ec2:CreateVolume",
                "ec2:CreateVpc",
                "ec2:CreateTags",
                "ec2:DeleteKeyPair",
                "ec2:DeleteSecurityGroup",
                "ec2:DeleteVolume",
                "ec2:DeleteVpc",
                "ec2:DeleteTags",
                "ec2:DescribeRouteTable",
                "ec2:DescribeSecurityGroups",
                "ec2:DescribeInstances",
                "ec2:DescribeVolumes",
                "ec2:DescribeImages",
                "ec2:DescribeTags",
                "ec2:DescribeInstanceAttribute"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

HPCCloud uses AWS access keys to make secure REST requests to AWS service APIs.
You should never share your secret key with anyone. Access keys can be created
from within the AWS Identity and Access management (IAM) console.

## Creating

Click the "+" icon in the toolbar. You'll be presented a blank form in which you can fill out details of your AWS profile. Most important are AWS key and secret key (do not share these keys with anyone and especially don't commit them to a repository, much less this one). If necessary select a different region and availability zone, US-East(a) is selected by default. Click "Save Profile" and your AWS credentials will be validated. If they're valid the profile will be saved. Your profile will be added to the list in the sidebar and you can now provision and launch EC2 instances from a Simulation Start view in a workflow.

## Editing

You cannot edit saved AWS profiles.

## Deleting

It is not possible to delete a profile that is associated with an existing cluster. To clear these clusters you can terminate and delete them from the status page under preferences. With the profile you want to delete selected, click "Delete profile." You will be prompted before the profile is deleted. This will not terminate still running instances associated with the profile. You will also not be able to access files generated from simulations which ran on instances using this profile, re-adding the profile will not allow you to do this either.
