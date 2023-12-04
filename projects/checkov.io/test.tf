resource "aws_s3_bucket" "foo-bucket" {
    region        = "us-east-1"
    bucket        = "test"
    acl           = "public-read"
    force_destroy = true

    versioning {
        enabled = true
    }
}