resource "aws_s3_bucket_logging" "example" {
    region        = "us-east-1"
    bucket        = "aws_s3_bucket.example.id"
    acl           = "public-read"
    force_destroy = true

    versioning {
        enabled = true
    }
}