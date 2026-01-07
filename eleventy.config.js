const pluginWebc = require("@11ty/eleventy-plugin-webc");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const { EleventyRenderPlugin } = require("@11ty/eleventy");
const yaml = require("js-yaml");
const htmlmin = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const { library, dom, config } = require('@fortawesome/fontawesome-svg-core');
const fas = require('@fortawesome/free-solid-svg-icons');
const fab = require('@fortawesome/free-brands-svg-icons');
const markdownIt = require("markdown-it");

library.add(fas.fas, fab.fab); 
config.autoAddCss = false;

module.exports = function(eleventyConfig) {
    eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));
    eleventyConfig.addGlobalData("faStyles", dom.css());
       
    const mdLib = markdownIt({
        html: true,
        breaks: true,
        linkify: true
    });
    eleventyConfig.setLibrary("md", mdLib);

    eleventyConfig.addPlugin(pluginWebc, {
        components: [
            "_components/**/*.webc",
            "npm:@11ty/is-land/*.webc"
        ]
    });

    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(EleventyRenderPlugin);

    eleventyConfig.addShortcode("icon", function(iconType, iconName, classNames = "") {
        const prefix = (iconType === 'fas' || iconType === 'solid' || iconType === 'fa-solid') ? 'fas' : 'fab';
        const pascalName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
        const finalName = `fa${pascalName}`;
        
        const iconData = (prefix === 'fas' ? fas : fab)[finalName];        
        if (!iconData) return ``;

        const [width, height, , , svgPathData] = iconData.icon;
        return `<svg aria-hidden="true" focusable="false" class="svg-inline--fa fa-${iconName} ${classNames}" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="height: 1em; vertical-align: -0.125em;"><path fill="currentColor" d="${svgPathData}"></path></svg>`;
    });
    eleventyConfig.addFilter("cssmin", function(code) {
        if (!code) return "";
        return new CleanCSS({}).minify(code).styles;
    });

    eleventyConfig.addFilter("md", function(content) {
        if (!content || typeof content !== 'string') return "";
        const md = new markdownIt({ html: true, breaks: true });
        return md.render(content);
    });

    eleventyConfig.addTransform("htmlmin", function(content) {
      if ((process.env.NODE_ENV === "production" || process.env.FINAL_BUILD === "true") && (this.page.outputPath || "").endsWith(".html")) {
            return htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
                processConditionalComments: true
            });
        }
        return content;
    });

    eleventyConfig.addPassthroughCopy({ "content/assets": "assets" });
    eleventyConfig.addPassthroughCopy({ "node_modules/@11ty/is-land/is-land.js": "assets/is-land.js" });

    eleventyConfig.addWatchTarget("./_components/**/*.webc");
    eleventyConfig.addWatchTarget("./_includes/**/*.webc");
    eleventyConfig.addWatchTarget("./_data/**/*.yaml");

    return {
        dir: {
            input: "content",
            includes: "../_includes",
            data: "../_data",
            output: "_site"
        },
        templateFormats: ["webc", "md", "njk", "html"],
        htmlTemplateEngine: "webc",
        markdownTemplateEngine: "webc"
    };
};