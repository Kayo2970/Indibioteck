import Quartz
import Foundation

let pdfURL = URL(fileURLWithPath: "/Users/kayo/Sites/Indibioteck/CATALOG/AGRI BOOKLET (2).pdf")
guard let pdf = CGPDFDocument(pdfURL as CFURL) else {
    print("Could not open PDF.")
    exit(1)
}

let pageCount = pdf.numberOfPages
print("Extracting \(pageCount) pages...")

let fm = FileManager.default
let outDir = "/Users/kayo/Sites/Indibioteck/images/agri_pdf"
try? fm.createDirectory(atPath: outDir, withIntermediateDirectories: true)

for i in 1...pageCount {
    guard let page = pdf.page(at: i) else { continue }
    let rect = page.getBoxRect(.mediaBox)
    
    // Scale for print (300dpi ish)
    let dpi: CGFloat = 300.0 / 72.0
    let width = Int(rect.size.width * dpi)
    let height = Int(rect.size.height * dpi)
    
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let bitmapInfo = CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue)
    
    guard let context = CGContext(data: nil,
                                  width: width,
                                  height: height,
                                  bitsPerComponent: 8,
                                  bytesPerRow: width * 4,
                                  space: colorSpace,
                                  bitmapInfo: bitmapInfo.rawValue) else { continue }
    
    context.setFillColor(gray: 1.0, alpha: 1.0)
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    
    context.scaleBy(x: dpi, y: dpi)
    context.drawPDFPage(page)
    
    guard let cgImage = context.makeImage() else { continue }
    
    let outURL = URL(fileURLWithPath: "\(outDir)/page_\(String(format: "%02d", i)).jpg")
    guard let dest = CGImageDestinationCreateWithURL(outURL as CFURL, kUTTypeJPEG, 1, nil) else { continue }
    CGImageDestinationAddImage(dest, cgImage, nil)
    CGImageDestinationFinalize(dest)
}
print("Done.")
