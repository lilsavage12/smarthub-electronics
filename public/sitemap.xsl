<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>XML Sitemap | SmartHub Electronics</title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<style type="text/css">
					body {
						font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
						color: #333;
						margin: 0;
						padding: 40px;
						background-color: #f4f7f9;
					}
					#content {
						margin: 0 auto;
						width: 1000px;
						background: #fff;
						padding: 40px;
						border-radius: 24px;
						box-shadow: 0 10px 30px rgba(0,0,0,0.05);
					}
					h1 {
						color: #000;
						font-weight: 900;
						font-size: 28px;
						margin: 0 0 10px 0;
						text-transform: uppercase;
						letter-spacing: -1px;
					}
					p {
						font-size: 14px;
						color: #666;
						margin-bottom: 30px;
					}
					table {
						border: none;
						border-collapse: collapse;
						width: 100%;
					}
					th {
						text-align: left;
						padding: 15px;
						font-size: 11px;
						font-weight: 900;
						text-transform: uppercase;
						letter-spacing: 1px;
						color: #999;
						border-bottom: 1px solid #eee;
					}
					td {
						padding: 15px;
						border-bottom: 1px solid #f9f9f9;
						font-size: 13px;
						color: #444;
					}
					tr:hover td {
						background-color: #fafafa;
					}
					a {
						color: #000;
						text-decoration: none;
						font-weight: 600;
					}
					a:hover {
						color: #2563eb;
					}
					.priority {
						display: inline-block;
						padding: 4px 8px;
						background: #eff6ff;
						color: #2563eb;
						border-radius: 6px;
						font-size: 10px;
						font-weight: 900;
					}
				</style>
			</head>
			<body>
				<div id="content">
					<h1>XML Sitemap</h1>
					<p>This is a professionally indexed map of SmartHub Electronics, generated specifically for search engines. It includes <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs.</p>
					
					<table cellpadding="3">
						<thead>
							<tr>
								<th width="70%">URL</th>
								<th width="10%">Priority</th>
								<th width="10%">Frequency</th>
								<th width="10%">Last Mod.</th>
							</tr>
						</thead>
						<tbody>
							<xsl:variable name="lower" select="'abcdefghijklmnopqrstuvwxyz'"/>
							<xsl:variable name="upper" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
							<xsl:for-each select="sitemap:urlset/sitemap:url">
								<tr>
									<td>
										<xsl:variable name="itemURL">
											<xsl:value-of select="sitemap:loc"/>
										</xsl:variable>
										<a href="{$itemURL}">
											<xsl:value-of select="sitemap:loc"/>
										</a>
									</td>
									<td>
										<span class="priority"><xsl:value-of select="concat(sitemap:priority*100,'%')"/></span>
									</td>
									<td>
										<xsl:value-of select="concat(translate(substring(sitemap:changefreq, 1, 1), $lower, $upper), substring(sitemap:changefreq, 2))"/>
									</td>
									<td>
										<xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))"/>
									</td>
								</tr>
							</xsl:for-each>
						</tbody>
					</table>
				</div>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
