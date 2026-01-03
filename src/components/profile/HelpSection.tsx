import { useState } from "react";
import { Search, MessagesSquare, Star, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ_DATA } from "@/lib/badges";

export function HelpSection() {
    const [search, setSearch] = useState("");

    const filteredFaq = FAQ_DATA.filter(item =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    );

    const handleWhatsApp = () => {
        window.open("https://wa.me/5511999999999", "_blank");
    };

    const handleRateApp = () => {
        // Mock Deep Link
        const isAndroid = /android/i.test(navigator.userAgent);
        const url = isAndroid ? "market://details?id=com.ascend.app" : "itms-apps://itunes.apple.com/app/id123456789";
        window.location.href = url;
    };

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Como posso ajudar?"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Accordion type="single" collapsible className="w-full">
                {filteredFaq.length > 0 ? (
                    filteredFaq.map((item, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="text-sm text-left">{item.q}</AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground">
                                {item.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))
                ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">Nenhum resultado encontrado.</p>
                )}
            </Accordion>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center" onClick={handleRateApp}>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-normal">Avaliar App</span>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center" onClick={handleWhatsApp}>
                    <MessagesSquare className="w-5 h-5 text-green-500" />
                    <span className="text-xs font-normal">Suporte WhatsApp</span>
                </Button>
            </div>
        </div>
    );
}
