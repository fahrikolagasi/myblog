import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteContent } from '../context/SiteContext';

const SEO = ({ title, description, keywords, image, url }) => {
    const { content } = useSiteContent();

    // Fallback data from SiteContext if props aren't provided
    const siteName = content?.profile?.name || 'Antigravity Portfolio';
    const siteTitle = content?.profile?.title || 'Fütüristik Yazılım Geliştirici';
    const siteDesc = content?.bio?.about || 'Modern web teknolojileri ve yapay zeka ile geliştirilmiş kişisel portfolyo.';
    const siteUrl = 'https://fahrikolagasi.com'; // User will update this later with env var or manually
    const siteImage = image || 'https://via.placeholder.com/1200x630.png?text=Portfolio';

    const cleanTitle = title ? `${title} | ${siteName}` : `${siteName} | ${siteTitle}`;
    const cleanDesc = description || siteDesc;
    const cleanKeywords = keywords || "yazılım, geliştirici, portfolio, react, yapay zeka, web tasarım";

    // Structured Data (JSON-LD) for Google Knowledge Graph
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": siteName,
        "url": url || siteUrl,
        "jobTitle": siteTitle,
        "image": siteImage,
        "sameAs": content?.socials?.filter(s => s.show).map(s => s.url) || [],
        "description": cleanDesc
    };

    return (
        <Helmet>
            {/* Standard Meta Tags */}
            <title>{cleanTitle}</title>
            <meta name="description" content={cleanDesc} />
            <meta name="keywords" content={cleanKeywords} />
            <meta name="author" content={siteName} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Open Graph / Facebook / LinkedIn */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url || siteUrl} />
            <meta property="og:title" content={cleanTitle} />
            <meta property="og:description" content={cleanDesc} />
            <meta property="og:image" content={siteImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={cleanTitle} />
            <meta name="twitter:description" content={cleanDesc} />
            <meta name="twitter:image" content={siteImage} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
};

export default SEO;
