import type { HeadlineType } from "../../types/cart"

const Headline = ({ headline, description }: HeadlineType) => {
    return (
        <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-primary tracking-tight mb-2">
                {headline}
            </h1>
            {description &&
                <p className="text-sm sm:text-base text-muted-foreground">
                    {description}
                </p>
            }
        </div>
    )
}

export default Headline
