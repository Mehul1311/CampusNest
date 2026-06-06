// "use client";

// import { Suspense, useEffect, useState, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Navbar } from "@/components/Navbar";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { getCategories } from "@/lib/api/categories";
// import { getItem } from "@/lib/api/items";
// import { createItem, updateItem } from "@/lib/api/items";
// import { uploadItemImage } from "@/lib/api/upload";
// import { useAuth } from "@/contexts/AuthContext";
// import { toast } from "sonner";
// import type { Category } from "@/lib/api/types";
// import { ArrowLeft, ImagePlus, X } from "lucide-react";
// import { getApiUrl } from "@/lib/api/config";

// function SellPageContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const editId = searchParams.get("edit");
//   const { user, loading: authLoading } = useAuth();
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [title, setTitle] = useState("");
//   const [categoryId, setCategoryId] = useState("");
//   const [price, setPrice] = useState("");
//   const [description, setDescription] = useState("");
//   const [images, setImages] = useState<string[]>([]);
//   const [imageLink, setImageLink] = useState("");
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [loading, setLoading] = useState(false);
//   const [loadingItem, setLoadingItem] = useState(!!editId);

//   const hasImage = images.length > 0;
//   const canAddImage = !hasImage;

//   function imageDisplayUrl(url: string) {
//     return url.startsWith("http") ? url : getApiUrl(url.startsWith("/") ? url : `/${url}`);
//   }

//   useEffect(() => {
//     getCategories().then((res) => {
//       if (res.success && res.data?.categories) setCategories(res.data.categories);
//     });
//   }, []);

//   useEffect(() => {
//     if (!editId) return;
//     getItem(editId)
//       .then((res) => {
//         if (res.success && res.data?.item) {
//           const item = res.data.item;
//           setTitle(item.title);
//           setCategoryId(item.category_id);
//           setPrice(item.price);
//           setDescription(item.description || "");
//           setImages(Array.isArray(item.images) && item.images.length ? [item.images[0]] : []);
//         }
//       })
//       .catch(() => toast.error("Failed to load item"))
//       .finally(() => setLoadingItem(false));
//   }, [editId]);

//   useEffect(() => {
//     if (!user && !authLoading) router.push("/login");
//   }, [user, authLoading, router]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const numPrice = parseFloat(price);
//     if (isNaN(numPrice) || numPrice < 0) {
//       toast.error("Enter a valid price");
//       return;
//     }
//     if (!categoryId) {
//       toast.error("Select a category");
//       return;
//     }
//     setLoading(true);
//     try {
//       if (editId) {
//         await updateItem(editId, {
//           title,
//           price: numPrice,
//           description: description || undefined,
//           images,
//         });
//         toast.success("Listing updated");
//       } else {
//         await createItem({
//           title,
//           categoryId,
//           price: numPrice,
//           description: description || undefined,
//           images: images.length ? images : undefined,
//         });
//         toast.success("Listing created");
//       }
//       router.push("/my-listings");
//       router.refresh();
//     } catch {
//       toast.error(editId ? "Failed to update" : "Failed to create listing");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (authLoading || (!user && !authLoading)) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <main className="mx-auto max-w-lg px-4 py-8">
//           <p className="text-muted-foreground">Loading...</p>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navbar />
//       <main className="mx-auto max-w-lg px-4 py-8">
//         <Link
//           href={editId ? "/my-listings" : "/"}
//           className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
//         >
//           <ArrowLeft className="h-4 w-4 mr-1" />
//           Back
//         </Link>
//         <Card>
//           <CardHeader>
//             <CardTitle>{editId ? "Edit listing" : "Sell an item"}</CardTitle>
//             <CardDescription>
//               {editId ? "Update your listing details." : "Add a new item to sell on CampusNest."}
//             </CardDescription>
//           </CardHeader>
//           <form onSubmit={handleSubmit}>
//             <CardContent className="space-y-4">
//               {loadingItem ? (
//                 <p className="text-sm text-muted-foreground">Loading...</p>
//               ) : (
//                 <>
//                   <div className="space-y-2">
//                     <Label htmlFor="title">Title</Label>
//                     <Input
//                       id="title"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       placeholder="e.g. Physics Textbook Class 12"
//                       required
//                       maxLength={500}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="category">Category</Label>
//                     <select
//                       id="category"
//                       value={categoryId}
//                       onChange={(e) => setCategoryId(e.target.value)}
//                       className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
//                       required
//                     >
//                       <option value="">Select category</option>
//                       {categories.map((c) => (
//                         <option key={c.id} value={c.id}>
//                           {c.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="price">Price (₹)</Label>
//                     <Input
//                       id="price"
//                       type="number"
//                       min={0}
//                       step={0.01}
//                       value={price}
//                       onChange={(e) => setPrice(e.target.value)}
//                       placeholder="250"
//                       required
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="description">Description (optional)</Label>
//                     <textarea
//                       id="description"
//                       value={description}
//                       onChange={(e) => setDescription(e.target.value)}
//                       placeholder="Condition, details..."
//                       className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
//                       rows={4}
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Item image (optional)</Label>
//                     <p className="text-xs text-muted-foreground">Upload a file or paste an image URL. Only one image allowed.</p>
//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       accept="image/jpeg,image/png,image/gif,image/webp"
//                       className="hidden"
//                       onChange={async (e) => {
//                         const file = e.target.files?.[0];
//                         if (!file) return;
//                         setUploadingImage(true);
//                         try {
//                           const url = await uploadItemImage(file);
//                           setImages([url]);
//                           toast.success("Image added");
//                         } catch {
//                           toast.error("Failed to upload image");
//                         } finally {
//                           setUploadingImage(false);
//                           e.target.value = "";
//                         }
//                       }}
//                     />
//                     <div className="flex flex-wrap gap-2 items-start">
//                       {images.map((url, idx) => (
//                         <div
//                           key={idx}
//                           className="relative w-20 h-20 rounded-md border border-input overflow-hidden bg-muted"
//                         >
//                           <Image
//                             src={imageDisplayUrl(url)}
//                             alt=""
//                             fill
//                             className="object-cover"
//                             unoptimized
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setImages([])}
//                             className="absolute top-0.5 right-0.5 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
//                             aria-label="Remove image"
//                           >
//                             <X className="h-3.5 w-3.5" />
//                           </button>
//                         </div>
//                       ))}
//                       {canAddImage && (
//                         <button
//                           type="button"
//                           onClick={() => fileInputRef.current?.click()}
//                           disabled={uploadingImage}
//                           className="w-20 h-20 rounded-md border border-dashed border-input flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
//                         >
//                           <ImagePlus className="h-6 w-6" />
//                           <span className="text-xs">{uploadingImage ? "Uploading..." : "Upload"}</span>
//                         </button>
//                       )}
//                     </div>
//                     {canAddImage && (
//                       <div className="flex gap-2">
//                         <Input
//                           type="url"
//                           placeholder="Or paste image link (e.g. https://...)"
//                           value={imageLink}
//                           onChange={(e) => setImageLink(e.target.value)}
//                           onKeyDown={(e) => {
//                             if (e.key === "Enter") {
//                               e.preventDefault();
//                               const link = imageLink.trim();
//                               if (!link) return;
//                               try {
//                                 new URL(link);
//                                 setImages([link]);
//                                 setImageLink("");
//                                 toast.success("Image link added");
//                               } catch {
//                                 toast.error("Please enter a valid URL");
//                               }
//                             }
//                           }}
//                           className="flex-1"
//                         />
//                         <Button
//                           type="button"
//                           variant="secondary"
//                           onClick={() => {
//                             const link = imageLink.trim();
//                             if (!link) {
//                               toast.error("Enter an image URL");
//                               return;
//                             }
//                             try {
//                               new URL(link);
//                               setImages([link]);
//                               setImageLink("");
//                               toast.success("Image link added");
//                             } catch {
//                               toast.error("Please enter a valid URL");
//                             }
//                           }}
//                         >
//                           Add link
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 </>
//               )}
//             </CardContent>
//             <CardFooter>
//               <Button type="submit" className="w-full" disabled={loading || loadingItem}>
//                 {loading ? (editId ? "Updating..." : "Creating...") : editId ? "Update listing" : "Create listing"}
//               </Button>
//             </CardFooter>
//           </form>
//         </Card>
//       </main>
//     </div>
//   );
// }

// export default function SellPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen bg-background">
//         <Navbar />
//         <main className="mx-auto max-w-lg px-4 py-8">
//           <p className="text-muted-foreground">Loading...</p>
//         </main>
//       </div>
//     }>
//       <SellPageContent />
//     </Suspense>
//   );
// }


"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/lib/api/categories";
import { getItem } from "@/lib/api/items";
import { createItem, updateItem } from "@/lib/api/items";
import { uploadItemImage } from "@/lib/api/upload";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Category } from "@/lib/api/types";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { getApiUrl } from "@/lib/api/config";

function SellPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageLink, setImageLink] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(!!editId);

  const hasImage = images.length > 0;
  const canAddImage = !hasImage;

  function imageDisplayUrl(url: string) {
    return url.startsWith("http") ? url : getApiUrl(url.startsWith("/") ? url : `/${url}`);
  }

  useEffect(() => {
    getCategories().then((res) => {
      if (res.success && res.data?.categories) setCategories(res.data.categories);
    });
  }, []);

  useEffect(() => {
    if (!editId) return;
    getItem(editId)
      .then((res) => {
        if (res.success && res.data?.item) {
          const item = res.data.item;
          setTitle(item.title);
          setCategoryId(item.category_id);
          setPrice(String(item.price)); // ✅ fix: number → string
          setDescription(item.description || "");
          setImages(Array.isArray(item.images) && item.images.length ? [item.images[0]] : []);
        }
      })
      .catch(() => toast.error("Failed to load item"))
      .finally(() => setLoadingItem(false));
  }, [editId]);

  useEffect(() => {
    if (!user && !authLoading) router.push("/login");
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (!categoryId) {
      toast.error("Select a category");
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await updateItem(editId, {
          title,
          price: numPrice,
          description: description || undefined,
          images,
        });
        toast.success("Listing updated");
      } else {
        await createItem({
          title,
          categoryId,
          price: numPrice,
          description: description || undefined,
          images: images.length ? images : undefined,
        });
        toast.success("Listing created");
      }
      router.push("/my-listings");
      router.refresh();
    } catch {
      toast.error(editId ? "Failed to update" : "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-8">
        <Link
          href={editId ? "/my-listings" : "/"}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>{editId ? "Edit listing" : "Sell an item"}</CardTitle>
            <CardDescription>
              {editId ? "Update your listing details." : "Add a new item to sell on CampusNest."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {loadingItem ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Physics Textbook Class 12"
                      required
                      maxLength={500}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="250"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Condition, details..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Item image (optional)</Label>
                    <p className="text-xs text-muted-foreground">Upload a file or paste an image URL. Only one image allowed.</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingImage(true);
                        try {
                          const url = await uploadItemImage(file);
                          setImages([url]);
                          toast.success("Image added");
                        } catch {
                          toast.error("Failed to upload image");
                        } finally {
                          setUploadingImage(false);
                          e.target.value = "";
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2 items-start">
                      {images.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-md border border-input overflow-hidden bg-muted"
                        >
                          <Image
                            src={imageDisplayUrl(url)}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => setImages([])}
                            className="absolute top-0.5 right-0.5 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                            aria-label="Remove image"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {canAddImage && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="w-20 h-20 rounded-md border border-dashed border-input flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                        >
                          <ImagePlus className="h-6 w-6" />
                          <span className="text-xs">{uploadingImage ? "Uploading..." : "Upload"}</span>
                        </button>
                      )}
                    </div>
                    {canAddImage && (
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          placeholder="Or paste image link (e.g. https://...)"
                          value={imageLink}
                          onChange={(e) => setImageLink(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const link = imageLink.trim();
                              if (!link) return;
                              try {
                                new URL(link);
                                setImages([link]);
                                setImageLink("");
                                toast.success("Image link added");
                              } catch {
                                toast.error("Please enter a valid URL");
                              }
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            const link = imageLink.trim();
                            if (!link) {
                              toast.error("Enter an image URL");
                              return;
                            }
                            try {
                              new URL(link);
                              setImages([link]);
                              setImageLink("");
                              toast.success("Image link added");
                            } catch {
                              toast.error("Please enter a valid URL");
                            }
                          }}
                        >
                          Add link
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading || loadingItem}>
                {loading ? (editId ? "Updating..." : "Creating...") : editId ? "Update listing" : "Create listing"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}

export default function SellPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    }>
      <SellPageContent />
    </Suspense>
  );
}