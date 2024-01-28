import Foundation

/// A point in a 2D coordinate system.

public struct Point {
    /// The x coordinate of the point.
    public var      x: Double     = 0.0

    /// The y coordinate of the point.
    public      var y: Double = 0.0

    /// Creates a point at (x, y).
    public init(x: Double, y: Double  ) {
        self.x = x
        self.y = y
    }

    /// Creates a point at (0, 0).
    public init(   ) {}
}