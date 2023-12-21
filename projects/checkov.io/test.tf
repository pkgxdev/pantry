provider "aws" {
    region = "eu-west-1"
}

provider "aws" {
    alias = "central"
    region = "eu-central-1"
}

data "aws_iam_policy_document" "foo_policy" {
    statement {
        effect = "Allow"
        principals = {
            type = "Service"
            identifiers = ["ec2.amazonaws.com"]
        }
        actions = [
            "s3:*"
        ]
        resources = [
            "${aws_s3_bucket.foo.arn}"
        ]
    }
}

resource "aws_s3_bucket_policy" "bar" {
    provider = "aws.central"
    bucket = "${aws_s3_bucket.foo.bucket}"
    policy = "${data.aws_iam_policy_document.foo_policy.json}"
}
