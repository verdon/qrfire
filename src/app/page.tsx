"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/browser";
import QRCode, { QRCodeRef } from "@/components/QRCode";
import { DotType, CornerSquareType, CornerDotType, DownloadOptions } from 'qr-code-styling';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function Home() {
  const [slug, setSlug] = useState("");
  const [url, setUrl] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isTransparent, setIsTransparent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [validationErrors, setValidationErrors] = useState({ url: "", slug: "" });
  const [qrValue, setQrValue] = useState("");
  const [fileExt, setFileExt] = useState<DownloadOptions['extension']>('png');

  const [dotStyle, setDotStyle] = useState<DotType>('square');
  const [cornerStyle, setCornerStyle] = useState<CornerSquareType>('square');
  const [cornerDotStyle, setCornerDotStyle] = useState<CornerDotType>('square');
  
  const qrCodeRef = useRef<QRCodeRef>(null);

  const finalUrl = `https://qr.yuze.social/${slug}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      // Show a default QR code pointing to the root, or the specific slug
      setQrValue(slug ? `${origin}/${slug}` : origin);
    }
  }, [slug]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedSlug = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, ''); // Remove any character that's not a letter, number, or hyphen
    setSlug(sanitizedSlug);
    if (sanitizedSlug) {
      setValidationErrors(prev => ({...prev, slug: ''}));
    }
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (e.target.value) {
      setValidationErrors(prev => ({...prev, url: ''}));
    }
  }

  const handleDownload = () => {
    if (qrCodeRef.current) {
      qrCodeRef.current.download({
        name: slug || 'qr-fire-code',
        extension: fileExt,
      });
    }
  };

  const validate = () => {
    const newErrors = { url: "", slug: "" };
    let isValid = true;

    if (!url) {
      newErrors.url = "Destination URL is required.";
      isValid = false;
    } else {
        try {
            const urlObject = new URL(url);
            if (urlObject.protocol !== "http:" && urlObject.protocol !== "https:") {
                newErrors.url = "Please enter a valid URL.";
                isValid = false;
            }
        } catch {
            newErrors.url = "Please enter a valid URL.";
            isValid = false;
        }
    }

    if (!slug) {
      newErrors.slug = "Slug is required.";
      isValid = false;
    }

    setValidationErrors(newErrors);
    return isValid;
  }

  const createQrCode = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      await addDoc(collection(db, "qr_codes"), {
        slug: slug,
        url: url,
        createdAt: serverTimestamp(),
        fgColor: fgColor,
        bgColor: bgColor,
        isTransparent: isTransparent,
        dotStyle: dotStyle,
        cornerStyle: cornerStyle,
        cornerDotStyle: cornerDotStyle,
      });
      
      toast.success("Slay! It&apos;s Live.", {
        description: `Your link ${finalUrl} is ready to go.`,
        action: {
          label: "Copy Link",
          onClick: () => {
            navigator.clipboard.writeText(finalUrl);
            toast.info("Link copied to clipboard!");
          },
        },
      });

      setSlug("");
      setUrl("");
    } catch (e) {
      setServerError("Error creating QR code. The slug might already exist.");
      console.error("Error adding document: ", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight">QR Fire</h1>
          <p className="text-muted-foreground mt-2">QR code hosting that don&apos;t cost.</p>
        </div>
      </header>
      <main className="container mx-auto flex flex-col items-center justify-center px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 w-full max-w-6xl mt-8">
          
          {/* QR Code Preview */}
          <Card className="flex flex-col bg-card/40 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-semibold">The Vibe</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'transparent' }}>
                <QRCode
                  ref={qrCodeRef}
                  value={qrValue}
                  size={256}
                  fgColor={fgColor}
                  bgColor={isTransparent ? '#00000000' : bgColor}
                  dotStyle={dotStyle}
                  cornerStyle={cornerStyle}
                  cornerDotStyle={cornerDotStyle}
                />
              </div>
              {slug && <p className="mt-4 text-sm font-mono bg-muted text-muted-foreground px-2 py-1 rounded">{finalUrl}</p>}
            </CardContent>
            <CardFooter>
                <div className="flex items-center gap-4 w-full max-w-[256px] mx-auto">
                    <Select value={fileExt} onValueChange={(v) => setFileExt(v as DownloadOptions['extension'])}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="png">PNG</SelectItem>
                            <SelectItem value="svg">SVG</SelectItem>
                            <SelectItem value="jpeg">JPEG</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleDownload} className="flex-1">Download</Button>
                </div>
            </CardFooter>
          </Card>

          {/* QR Code Creation Form */}
          <Card className="w-full bg-card/40 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle>Glow Up Your QR</CardTitle>
              <CardDescription>Drop a link, name your vibe, and make it yours.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">Destination URL</Label>
                <Input id="url" placeholder="https://your-destination-link.com" value={url} onChange={handleUrlChange} />
                {validationErrors.url && <p className="text-sm text-destructive pt-1">{validationErrors.url}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Custom Vibe Name (Slug)</Label>
                <Input id="slug" placeholder="e.g., wow-doge for https://qr.yuze.social/wow-doge" value={slug} onChange={handleSlugChange} />
                {validationErrors.slug && <p className="text-sm text-destructive pt-1">{validationErrors.slug}</p>}
                {!validationErrors.slug && slug && <p className="text-sm text-muted-foreground pt-1">It&apos;s giving: <span className="font-medium text-primary">{finalUrl}</span></p>}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">The Aesthetics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Dot Style</Label>
                    <Select value={dotStyle} onValueChange={(v) => setDotStyle(v as DotType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dots">Dots</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="classy">Classy</SelectItem>
                        <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Corner Style</Label>
                    <Select value={cornerStyle} onValueChange={(v) => setCornerStyle(v as CornerSquareType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dot">Dot</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Corner Dot Style</Label>
                    <Select value={cornerDotStyle} onValueChange={(v) => setCornerDotStyle(v as CornerDotType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dot">Dot</SelectItem>
                        <SelectItem value="square">Square</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Foreground</Label>
                    <Input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-10 p-1" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Background</Label>
                    <div className="flex items-center gap-2">
                      <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 p-1" disabled={isTransparent} />
                      <div className="flex items-center space-x-2">
                        <Checkbox id="transparent" checked={isTransparent} onCheckedChange={(checked) => setIsTransparent(checked as boolean)} />
                        <label
                          htmlFor="transparent"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Transparent
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            </CardContent>
            <CardFooter>
              <Button onClick={createQrCode} disabled={loading} className="w-full">
                {loading ? "Making it happen..." : "Make it Happen"}
              </Button>
            </CardFooter>
          </Card>

        </div>
      </main>
    </div>
  );
}
