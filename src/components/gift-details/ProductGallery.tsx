import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductGalleryProps } from '../../types/gifts'

export function ProductGallery({ giftName, images, selectedImage, onSelectImage }: ProductGalleryProps) {
    const showPreviousImage = () => onSelectImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)
    const showNextImage = () => onSelectImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1)

    return (
        <section aria-label="Produktbilder" className="flex min-w-0 flex-col gap-4">
            <div className="group relative flex aspect-square min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-3xl border border-border bg-[#f1eee7] p-7 sm:aspect-[4/3] sm:p-12">
                <img className="block max-h-full max-w-full object-contain mix-blend-multiply" src={images[selectedImage]} alt={`${giftName}${selectedImage > 0 ? `, bild ${selectedImage + 1}` : ''}`} />
                {images.length > 1 && (
                    <>
                        <button className="absolute left-3 grid size-10 cursor-pointer place-items-center rounded-full border border-border bg-surface/90 text-primary shadow-sm transition-colors hover:bg-white sm:left-4" onClick={showPreviousImage} aria-label="Visa föregående bild">
                            <ChevronLeft className="size-5" aria-hidden="true" />
                        </button>
                        <button className="absolute right-3 grid size-10 cursor-pointer place-items-center rounded-full border border-border bg-surface/90 text-primary shadow-sm transition-colors hover:bg-white sm:right-4" onClick={showNextImage} aria-label="Visa nästa bild">
                            <ChevronRight className="size-5" aria-hidden="true" />
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2" aria-label="Välj produktbild">
                    {images.map((image, index) => (
                        <button className={`flex aspect-square w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 bg-[#f1eee7] p-2 transition-colors sm:w-24 ${selectedImage === index ? 'border-primary' : 'border-border hover:border-border-strong'}`} type="button" onClick={() => onSelectImage(index)} aria-label={`Visa bild ${index + 1} av ${images.length}`} aria-pressed={selectedImage === index} key={image}>
                            <img className="block max-h-full max-w-full object-contain mix-blend-multiply" src={image} alt="" />
                        </button>
                    ))}
                </div>
            )}
        </section>
    )
}